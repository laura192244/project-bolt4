-- ============================================================================
-- SkillHub / iqskill.am  ·  Phase 1: schema + security + seed data
-- ----------------------------------------------------------------------------
-- Paste this whole file into the Supabase SQL Editor and click "Run".
-- It is SAFE TO RUN MORE THAN ONCE (uses IF NOT EXISTS / OR REPLACE / ON CONFLICT).
-- ============================================================================


-- ============================================================================
-- 1. TABLES
-- ============================================================================

-- 1a. profiles — one row per user, linked to Supabase's built-in auth.users table.
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  first_name  text,
  last_name   text,
  birthday    date,
  role        text not null default 'user' check (role in ('user', 'admin')),
  created_at  timestamptz not null default now()
);

-- 1b. courses — the top-level container (no lesson content of its own).
create table if not exists public.courses (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title_hy        text not null,
  title_en        text not null,
  description_hy  text,
  description_en  text,
  position        integer not null default 0,
  created_at      timestamptz not null default now()
);

-- 1c. subcourses — the lessons inside a course. The actual content lives here.
create table if not exists public.subcourses (
  id              uuid primary key default gen_random_uuid(),
  course_id       uuid not null references public.courses (id) on delete cascade,
  title_hy        text not null,
  title_en        text not null,
  description_hy  text,
  description_en  text,
  content_hy      text,
  content_en      text,
  videos          jsonb not null default '[]'::jsonb,
  position        integer not null default 0,
  created_at      timestamptz not null default now()
);

-- 1d. quizzes — one 'subcourse' quiz per subcourse, one 'final' quiz per course.
create table if not exists public.quizzes (
  id              uuid primary key default gen_random_uuid(),
  course_id       uuid references public.courses (id) on delete cascade,
  subcourse_id    uuid references public.subcourses (id) on delete cascade,
  kind            text not null check (kind in ('subcourse', 'final')),
  question_count  integer not null default 10,
  created_at      timestamptz not null default now(),
  -- A subcourse quiz targets a subcourse; a final quiz targets a course.
  constraint quiz_target_matches_kind check (
    (kind = 'subcourse' and subcourse_id is not null and course_id is null) or
    (kind = 'final'     and course_id   is not null and subcourse_id is null)
  )
);

-- Enforce "at most one subcourse quiz per subcourse" and "one final quiz per course".
create unique index if not exists quizzes_one_per_subcourse
  on public.quizzes (subcourse_id) where subcourse_id is not null;
create unique index if not exists quizzes_one_final_per_course
  on public.quizzes (course_id) where course_id is not null;

-- 1e. quiz_questions — the FULL POOL of questions. Each attempt draws a random subset.
create table if not exists public.quiz_questions (
  id             uuid primary key default gen_random_uuid(),
  quiz_id        uuid not null references public.quizzes (id) on delete cascade,
  question_hy    text not null,
  question_en    text not null,
  options_hy     jsonb not null,   -- array of strings, e.g. ["a","b","c","d"]
  options_en     jsonb not null,
  correct_answer integer not null, -- 0-based index into the options
  created_at     timestamptz not null default now()
);

-- 1f. quiz_results — a saved attempt (score out of total).
create table if not exists public.quiz_results (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  quiz_id       uuid not null references public.quizzes (id) on delete cascade,
  course_id     uuid not null references public.courses (id) on delete cascade,
  subcourse_id  uuid references public.subcourses (id) on delete cascade,
  score         integer not null,
  total         integer not null,
  submitted_at  timestamptz not null default now()
);

-- A few indexes for the lookups the app does most often.
create index if not exists subcourses_course_idx    on public.subcourses (course_id);
create index if not exists quiz_questions_quiz_idx   on public.quiz_questions (quiz_id);
create index if not exists quiz_results_user_idx     on public.quiz_results (user_id);
create index if not exists quiz_results_course_idx   on public.quiz_results (course_id);


-- ============================================================================
-- 2. HELPER FUNCTION: is the current user an admin?
-- ----------------------------------------------------------------------------
-- SECURITY DEFINER lets this read profiles without re-triggering RLS, which
-- avoids an infinite loop when the profiles policies themselves call it.
-- ============================================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;


-- ============================================================================
-- 3. AUTO-CREATE a profile row whenever someone signs up
-- ----------------------------------------------------------------------------
-- first_name / last_name / birthday come from the sign-up form (Phase 2),
-- which passes them as user "metadata".
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, first_name, last_name, birthday)
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    nullif(new.raw_user_meta_data ->> 'birthday', '')::date
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================================
-- 4. GUARD: stop a normal user from making themselves an admin
-- ----------------------------------------------------------------------------
-- Users may edit their own profile (name, birthday) but not their "role".
-- auth.uid() is NULL when you run SQL here in the dashboard, so the admin-
-- granting line at the very bottom still works.
-- ============================================================================
create or replace function public.guard_profile_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Only admins can change a profile role';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_profile_role on public.profiles;
create trigger guard_profile_role
  before update on public.profiles
  for each row execute function public.guard_profile_role();


-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------------------------
-- RLS = "which rows is this request allowed to see/change?". With it ON and no
-- matching policy, access is denied by default. We open exactly what we need.
-- ============================================================================
alter table public.profiles       enable row level security;
alter table public.courses        enable row level security;
alter table public.subcourses     enable row level security;
alter table public.quizzes        enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_results   enable row level security;

-- profiles: you can see & edit your own row; admins can see everyone.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles
  for insert with check (id = auth.uid());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- Content tables (courses, subcourses, quizzes, quiz_questions):
--   EVERYONE (even logged-out visitors) can READ.
--   Only ADMINS can INSERT / UPDATE / DELETE.
drop policy if exists courses_read  on public.courses;
create policy courses_read  on public.courses for select using (true);
drop policy if exists courses_admin on public.courses;
create policy courses_admin on public.courses for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists subcourses_read  on public.subcourses;
create policy subcourses_read  on public.subcourses for select using (true);
drop policy if exists subcourses_admin on public.subcourses;
create policy subcourses_admin on public.subcourses for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists quizzes_read  on public.quizzes;
create policy quizzes_read  on public.quizzes for select using (true);
drop policy if exists quizzes_admin on public.quizzes;
create policy quizzes_admin on public.quizzes for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists quiz_questions_read  on public.quiz_questions;
create policy quiz_questions_read  on public.quiz_questions for select using (true);
drop policy if exists quiz_questions_admin on public.quiz_questions;
create policy quiz_questions_admin on public.quiz_questions for all
  using (public.is_admin()) with check (public.is_admin());

-- quiz_results: you can insert & read your OWN results; admins can read all.
drop policy if exists quiz_results_insert on public.quiz_results;
create policy quiz_results_insert on public.quiz_results
  for insert with check (user_id = auth.uid());

drop policy if exists quiz_results_select on public.quiz_results;
create policy quiz_results_select on public.quiz_results
  for select using (user_id = auth.uid() or public.is_admin());


-- ============================================================================
-- 6. SEED DATA — migrate the 4 existing courses (nothing is lost)
-- ----------------------------------------------------------------------------
-- Each course gets ONE subcourse holding its current content + videos, ONE
-- subcourse quiz loaded with its existing questions, and ONE empty final quiz.
-- Fixed UUIDs make re-running harmless (ON CONFLICT DO NOTHING).
-- ============================================================================

-- 6a. Courses -----------------------------------------------------------------
insert into public.courses (id, slug, title_hy, title_en, description_hy, description_en, position) values
('aa000000-0000-0000-0000-000000000001', 'sql',
 $seed$SQL Տվյալների բազաներ$seed$, $seed$SQL Databases$seed$,
 $seed$Սովորեք SQL լեզուն և տվյալների բազաների կառավարումը։ Ծանոթացեք SELECT, INSERT, UPDATE հրամաններին։$seed$,
 $seed$Learn SQL language and database management. Get familiar with SELECT, INSERT, UPDATE commands.$seed$, 1),
('aa000000-0000-0000-0000-000000000002', 'python',
 $seed$Python Ծրագրավորում$seed$, $seed$Python Programming$seed$,
 $seed$Տիրապետեք Python լեզվին՝ սկսած հիմունքներից մինչև առաջադեմ թեմաներ։$seed$,
 $seed$Master Python language from basics to advanced topics.$seed$, 2),
('aa000000-0000-0000-0000-000000000003', 'csharp',
 $seed$C# Ծրագրավորում$seed$, $seed$C# Programming$seed$,
 $seed$Սովորեք C# լեզուն և .NET շրջակայքը ժամանակակից ծրագրեր ստեղծելու համար։$seed$,
 $seed$Learn C# language and .NET framework to create modern applications.$seed$, 3),
('aa000000-0000-0000-0000-000000000004', 'html',
 $seed$HTML և Վեբ Զարգացում$seed$, $seed$HTML & Web Development$seed$,
 $seed$Ստեղծեք վեբ էջեր HTML-ի և CSS-ի միջոցով։ Սովորեք վեբ դիզայնի հիմունքները։$seed$,
 $seed$Create web pages using HTML and CSS. Learn web design fundamentals.$seed$, 4)
on conflict (id) do nothing;

-- 6b. Subcourses (one per course, holding the current content + videos) --------
insert into public.subcourses (id, course_id, title_hy, title_en, description_hy, description_en, content_hy, content_en, videos, position) values
('bb000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000001',
 $seed$Ներածություն$seed$, $seed$Introduction$seed$,
 $seed$SQL-ի հիմունքները՝ SELECT, INSERT, UPDATE, DELETE։$seed$,
 $seed$SQL fundamentals: SELECT, INSERT, UPDATE, DELETE.$seed$,
 $seed$SQL Տվյալների բազաներ - Ներածություն....

Բովանդակություն:

1. Ինչ է SQL-ը?
SQL (Structured Query Language) կառուցվածքային հարցումների լեզու է, որն օգտագործվում է տվյալների բազաների հետ աշխատելու համար։

2. Հիմնական հրամաններ:

SELECT - Տվյալների ընտրություն
  Օրինակ: SELECT * FROM users;

INSERT - Նոր տվյալների ավելացում
  Օրինակ: INSERT INTO users (name, email) VALUES ('Արման', 'arman@mail.com');

UPDATE - Տվյալների թարմացում
  Օրինակ: UPDATE users SET name='Անի' WHERE id=1;

DELETE - Տվյալների ջնջում
  Օրինակ: DELETE FROM users WHERE id=1;

3. Աղյուսակների ստեղծում:

CREATE TABLE users (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100)
);

4. Փաստաթղթերի միացում:

SELECT users.name, orders.product
FROM users
INNER JOIN orders ON users.id = orders.user_id;

5. Եզրակացություն:
SQL-ը հզոր գործիք է տվյալների բազաների կառավարման համար։ Այն թույլ է տալիս արդյունավետ աշխատել տվյալների հետ։$seed$,
 $seed$SQL Databases - Introduction

Table of Contents:

1. What is SQL?
SQL (Structured Query Language) is a structured query language used to work with databases.

2. Basic Commands:

SELECT - Data retrieval
  Example: SELECT * FROM users;

INSERT - Adding new data
  Example: INSERT INTO users (name, email) VALUES ('John', 'john@mail.com');

UPDATE - Updating data
  Example: UPDATE users SET name='Jane' WHERE id=1;

DELETE - Deleting data
  Example: DELETE FROM users WHERE id=1;

3. Creating Tables:

CREATE TABLE users (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100)
);

4. Joining Tables:

SELECT users.name, orders.product
FROM users
INNER JOIN orders ON users.id = orders.user_id;

5. Conclusion:
SQL is a powerful tool for database management. It allows efficient work with data.$seed$,
 '["https://youtu.be/7S_tz1z_5bA?si=XBoBvcDsuXleY18f"]'::jsonb, 1),

('bb000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000002',
 $seed$Հիմունքներ$seed$, $seed$Basics$seed$,
 $seed$Python-ի հիմունքները՝ փոփոխականներ, ցիկլեր, ֆունկցիաներ։$seed$,
 $seed$Python fundamentals: variables, loops, functions.$seed$,
 $seed$Python Ծրագրավորում - Հիմունքներ

Բովանդակություն:

1. Python-ի ներածություն
Python-ը հեշտ սովորելի և հզոր ծրագրավորման լեզու է։

2. Փոփոխականներ և տվյալների տիպեր:

# Ամբողջ թվեր
age = 25

# Տողեր
name = "Արման"

# Ցուցակներ
fruits = ["խնձոր", "տանձ", "բանան"]

# Բառարաններ
person = {"name": "Անի", "age": 30}

3. Պայմաններ:

if age >= 18:
    print("Չափահաս")
else:
    print("Անչափահաս")

4. Ցիկլեր:

# For ցիկլ
for fruit in fruits:
    print(fruit)

# While ցիկլ
i = 0
while i < 5:
    print(i)
    i += 1

5. Ֆունկցիաներ:

def greet(name):
    return f"Բարև, {name}!"

print(greet("Արման"))

6. Եզրակացություն:
Python-ը հարմար է սկսնակների համար և լայնորեն օգտագործվում է ինչպես վեբ մշակման, այնպես էլ տվյալների վերլուծության մեջ։$seed$,
 $seed$Python Programming - Basics

Table of Contents:

1. Introduction to Python
Python is an easy-to-learn and powerful programming language.

2. Variables and Data Types:

# Integers
age = 25

# Strings
name = "John"

# Lists
fruits = ["apple", "pear", "banana"]

# Dictionaries
person = {"name": "Jane", "age": 30}

3. Conditions:

if age >= 18:
    print("Adult")
else:
    print("Minor")

4. Loops:

# For loop
for fruit in fruits:
    print(fruit)

# While loop
i = 0
while i < 5:
    print(i)
    i += 1

5. Functions:

def greet(name):
    return f"Hello, {name}!"

print(greet("John"))

6. Conclusion:
Python is suitable for beginners and widely used in both web development and data analysis.$seed$,
 '["https://youtu.be/K5KVEU3aaeQ?si=CexfO_OqhxI1bx47"]'::jsonb, 1),

('bb000000-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000003',
 $seed$Հիմունքներ$seed$, $seed$Basics$seed$,
 $seed$C#-ի հիմունքները՝ շարահյուսություն, մեթոդներ, դասեր։$seed$,
 $seed$C# fundamentals: syntax, methods, classes.$seed$,
 $seed$C# Ծրագրավորում - Հիմունքներ

Բովանդակություն:

1. C#-ի ներածություն
C#-ը Microsoft-ի կողմից մշակված ժամանակակից, օբյեկտ-կողմնորոշված ծրագրավորման լեզու է։

2. Հիմնական շարահյուսություն:

// Պարզ ծրագիր
using System;

class Program
{
    static void Main()
    {
        Console.WriteLine("Բարև, աշխարհ!");
    }
}

3. Փոփոխականներ և տվյալների տիպեր:

int age = 25;
string name = "Արման";
bool isStudent = true;
double price = 99.99;

4. Պայմաններ և ցիկլեր:

// If պայման
if (age >= 18)
{
    Console.WriteLine("Չափահաս");
}

// For ցիկլ
for (int i = 0; i < 5; i++)
{
    Console.WriteLine(i);
}

5. Մեթոդներ:

public static int Add(int a, int b)
{
    return a + b;
}

6. Դասեր և օբյեկտներ:

class Person
{
    public string Name { get; set; }
    public int Age { get; set; }

    public void Introduce()
    {
        Console.WriteLine($"Ես {Name}-ն եմ, {Age} տարեկան");
    }
}

7. Եզրակացություն:
C#-ը հզոր լեզու է Windows հավելվածների, խաղերի (Unity) և վեբ ծառայությունների ստեղծման համար։$seed$,
 $seed$C# Programming - Basics

Table of Contents:

1. Introduction to C#
C# is a modern, object-oriented programming language developed by Microsoft.

2. Basic Syntax:

// Simple program
using System;

class Program
{
    static void Main()
    {
        Console.WriteLine("Hello, World!");
    }
}

3. Variables and Data Types:

int age = 25;
string name = "John";
bool isStudent = true;
double price = 99.99;

4. Conditions and Loops:

// If condition
if (age >= 18)
{
    Console.WriteLine("Adult");
}

// For loop
for (int i = 0; i < 5; i++)
{
    Console.WriteLine(i);
}

5. Methods:

public static int Add(int a, int b)
{
    return a + b;
}

6. Classes and Objects:

class Person
{
    public string Name { get; set; }
    public int Age { get; set; }

    public void Introduce()
    {
        Console.WriteLine($"I am {Name}, {Age} years old");
    }
}

7. Conclusion:
C# is a powerful language for creating Windows applications, games (Unity), and web services.$seed$,
 '[]'::jsonb, 1),

('bb000000-0000-0000-0000-000000000004', 'aa000000-0000-0000-0000-000000000004',
 $seed$Հիմունքներ$seed$, $seed$Basics$seed$,
 $seed$HTML-ի և CSS-ի հիմունքները՝ թեգեր, ցուցակներ, ձևեր։$seed$,
 $seed$HTML & CSS fundamentals: tags, lists, forms.$seed$,
 $seed$HTML և Վեբ Զարգացում - Հիմունքներ

Բովանդակություն:

1. Ինչ է HTML-ը?
HTML (HyperText Markup Language) նշագրման լեզու է, որն օգտագործվում է վեբ էջեր ստեղծելու համար։

2. Հիմնական կառուցվածք:

<!DOCTYPE html>
<html>
<head>
    <title>Իմ կայքը</title>
</head>
<body>
    <h1>Բարև, աշխարհ!</h1>
    <p>Սա իմ առաջին վեբ էջն է։</p>
</body>
</html>

3. Հիմնական թեգեր:

<h1> մինչև <h6> - Վերնագրեր
<p> - Պարբերություն
<a href="url"> - Հղում
<img src="image.jpg"> - Նկար
<div> - Կոնտեյներ
<span> - Տողային կոնտեյներ

4. Ցուցակներ:

<!-- Համարակալված -->
<ol>
    <li>Առաջին</li>
    <li>Երկրորդ</li>
</ol>

<!-- Չհամարակալված -->
<ul>
    <li>Կետ 1</li>
    <li>Կետ 2</li>
</ul>

5. Աղյուսակներ:

<table>
    <tr>
        <th>Անուն</th>
        <th>Տարիք</th>
    </tr>
    <tr>
        <td>Արման</td>
        <td>25</td>
    </tr>
</table>

6. Ձևեր (Forms):

<form>
    <input type="text" placeholder="Անուն">
    <input type="email" placeholder="Էլ․ հասցե">
    <button type="submit">Ուղարկել</button>
</form>

7. CSS հիմունքներ:

<style>
    body {
        background-color: #f0f0f0;
        font-family: Arial, sans-serif;
    }
    h1 {
        color: blue;
    }
</style>

8. Եզրակացություն:
HTML-ը վեբ էջերի հիմքն է։ CSS-ի և JavaScript-ի հետ միասին թույլ է տալիս ստեղծել գեղեցիկ և ինտերակտիվ կայքեր։$seed$,
 $seed$HTML & Web Development - Basics

Table of Contents:

1. What is HTML?
HTML (HyperText Markup Language) is a markup language used to create web pages.

2. Basic Structure:

<!DOCTYPE html>
<html>
<head>
    <title>My Website</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>This is my first web page.</p>
</body>
</html>

3. Basic Tags:

<h1> to <h6> - Headings
<p> - Paragraph
<a href="url"> - Link
<img src="image.jpg"> - Image
<div> - Container
<span> - Inline container

4. Lists:

<!-- Ordered -->
<ol>
    <li>First</li>
    <li>Second</li>
</ol>

<!-- Unordered -->
<ul>
    <li>Item 1</li>
    <li>Item 2</li>
</ul>

5. Tables:

<table>
    <tr>
        <th>Name</th>
        <th>Age</th>
    </tr>
    <tr>
        <td>John</td>
        <td>25</td>
    </tr>
</table>

6. Forms:

<form>
    <input type="text" placeholder="Name">
    <input type="email" placeholder="Email">
    <button type="submit">Submit</button>
</form>

7. CSS Basics:

<style>
    body {
        background-color: #f0f0f0;
        font-family: Arial, sans-serif;
    }
    h1 {
        color: blue;
    }
</style>

8. Conclusion:
HTML is the foundation of web pages. Together with CSS and JavaScript, it allows creating beautiful and interactive websites.$seed$,
 '[]'::jsonb, 1)
on conflict (id) do nothing;

-- 6c. Quizzes: one 'subcourse' quiz per subcourse + one empty 'final' quiz per course
insert into public.quizzes (id, subcourse_id, course_id, kind, question_count) values
('cc000000-0000-0000-0000-000000000001', 'bb000000-0000-0000-0000-000000000001', null, 'subcourse', 5),
('cc000000-0000-0000-0000-000000000002', 'bb000000-0000-0000-0000-000000000002', null, 'subcourse', 5),
('cc000000-0000-0000-0000-000000000003', 'bb000000-0000-0000-0000-000000000003', null, 'subcourse', 5),
('cc000000-0000-0000-0000-000000000004', 'bb000000-0000-0000-0000-000000000004', null, 'subcourse', 5),
('dd000000-0000-0000-0000-000000000001', null, 'aa000000-0000-0000-0000-000000000001', 'final', 10),
('dd000000-0000-0000-0000-000000000002', null, 'aa000000-0000-0000-0000-000000000002', 'final', 10),
('dd000000-0000-0000-0000-000000000003', null, 'aa000000-0000-0000-0000-000000000003', 'final', 10),
('dd000000-0000-0000-0000-000000000004', null, 'aa000000-0000-0000-0000-000000000004', 'final', 10)
on conflict (id) do nothing;

-- 6d. Quiz questions (the pools) ----------------------------------------------
-- SQL
insert into public.quiz_questions (id, quiz_id, question_hy, question_en, options_hy, options_en, correct_answer) values
('ee000000-0000-0000-0000-000000000011', 'cc000000-0000-0000-0000-000000000001',
 $seed$Ի՞նչ է SQL-ը։$seed$, $seed$What is SQL?$seed$,
 $seed$["Ծրագրավորման լեզու","Տվյալների բազաների կառավարման համակարգ","Կառուցվածքային հարցումների լեզու","Օպերացիոն համակարգ"]$seed$::jsonb,
 $seed$["A programming language","A database management system","A structured query language","An operating system"]$seed$::jsonb, 2),
('ee000000-0000-0000-0000-000000000012', 'cc000000-0000-0000-0000-000000000001',
 $seed$Ո՞ր հրամանն է օգտագործվում տվյալներ ընտրելու համար։$seed$, $seed$Which command is used to retrieve data?$seed$,
 $seed$["INSERT","SELECT","UPDATE","DELETE"]$seed$::jsonb,
 $seed$["INSERT","SELECT","UPDATE","DELETE"]$seed$::jsonb, 1),
('ee000000-0000-0000-0000-000000000013', 'cc000000-0000-0000-0000-000000000001',
 $seed$Ինչպե՞ս կավելացնենք նոր տող աղյուսակում։$seed$, $seed$How do we add a new row to a table?$seed$,
 $seed$["SELECT","UPDATE","INSERT","CREATE"]$seed$::jsonb,
 $seed$["SELECT","UPDATE","INSERT","CREATE"]$seed$::jsonb, 2),
('ee000000-0000-0000-0000-000000000014', 'cc000000-0000-0000-0000-000000000001',
 $seed$Ո՞ր հրամանով կարող ենք թարմացնել տվյալները։$seed$, $seed$Which command can update data?$seed$,
 $seed$["UPDATE","MODIFY","CHANGE","ALTER"]$seed$::jsonb,
 $seed$["UPDATE","MODIFY","CHANGE","ALTER"]$seed$::jsonb, 0),
('ee000000-0000-0000-0000-000000000015', 'cc000000-0000-0000-0000-000000000001',
 $seed$Ինչու՞ է օգտագործվում PRIMARY KEY-ը։$seed$, $seed$Why is PRIMARY KEY used?$seed$,
 $seed$["Տվյալների դասակարգման համար","Յուրաքանչյուր տողի եզակի նույնականացման համար","Տվյալների ջնջման համար","Աղյուսակի անվան համար"]$seed$::jsonb,
 $seed$["For data sorting","For unique identification of each row","For data deletion","For table naming"]$seed$::jsonb, 1),
-- Python
('ee000000-0000-0000-0000-000000000021', 'cc000000-0000-0000-0000-000000000002',
 $seed$Ինչպե՞ս է հայտարարվում փոփոխական Python-ում։$seed$, $seed$How is a variable declared in Python?$seed$,
 $seed$["var x = 5","int x = 5","x = 5","let x = 5"]$seed$::jsonb,
 $seed$["var x = 5","int x = 5","x = 5","let x = 5"]$seed$::jsonb, 2),
('ee000000-0000-0000-0000-000000000022', 'cc000000-0000-0000-0000-000000000002',
 $seed$Ո՞ր տվյալների տիպը չի գոյություն ունենում Python-ում։$seed$, $seed$Which data type does not exist in Python?$seed$,
 $seed$["int","string","char","list"]$seed$::jsonb,
 $seed$["int","string","char","list"]$seed$::jsonb, 2),
('ee000000-0000-0000-0000-000000000023', 'cc000000-0000-0000-0000-000000000002',
 $seed$Ինչպե՞ս սահմանել ֆունկցիա Python-ում։$seed$, $seed$How to define a function in Python?$seed$,
 $seed$["function myFunc():","def myFunc():","func myFunc():","define myFunc():"]$seed$::jsonb,
 $seed$["function myFunc():","def myFunc():","func myFunc():","define myFunc():"]$seed$::jsonb, 1),
('ee000000-0000-0000-0000-000000000024', 'cc000000-0000-0000-0000-000000000002',
 $seed$Ինչ կլինի print(type(5)) հրամանի արդյունքը։$seed$, $seed$What will be the result of print(type(5))?$seed$,
 $seed$["<class 'int'>","<class 'number'>","integer","int"]$seed$::jsonb,
 $seed$["<class 'int'>","<class 'number'>","integer","int"]$seed$::jsonb, 0),
('ee000000-0000-0000-0000-000000000025', 'cc000000-0000-0000-0000-000000000002',
 $seed$Ո՞ր օպերատորն է օգտագործվում բաժանման մնացորդը գտնելու համար։$seed$, $seed$Which operator is used to find the remainder of division?$seed$,
 $seed$["/","%","//","mod"]$seed$::jsonb,
 $seed$["/","%","//","mod"]$seed$::jsonb, 1),
-- C#
('ee000000-0000-0000-0000-000000000031', 'cc000000-0000-0000-0000-000000000003',
 $seed$Ո՞վ է մշակել C# լեզուն։$seed$, $seed$Who developed the C# language?$seed$,
 $seed$["Google","Apple","Microsoft","Oracle"]$seed$::jsonb,
 $seed$["Google","Apple","Microsoft","Oracle"]$seed$::jsonb, 2),
('ee000000-0000-0000-0000-000000000032', 'cc000000-0000-0000-0000-000000000003',
 $seed$Ինչպե՞ս է հայտարարվում մեթոդը C#-ում։$seed$, $seed$How is a method declared in C#?$seed$,
 $seed$["def Method():","function Method()","public void Method()","method Method()"]$seed$::jsonb,
 $seed$["def Method():","function Method()","public void Method()","method Method()"]$seed$::jsonb, 2),
('ee000000-0000-0000-0000-000000000033', 'cc000000-0000-0000-0000-000000000003',
 $seed$Ինչ կլինի Console.WriteLine("Hello"); հրամանի արդյունքը։$seed$, $seed$What will be the result of Console.WriteLine("Hello");?$seed$,
 $seed$["Կտպի \"Hello\" էկրանին","Կստեղծի սխալ","Ոչինչ չի տպի","Կվերադարձնի \"Hello\""]$seed$::jsonb,
 $seed$["Will print \"Hello\" to the screen","Will create an error","Will print nothing","Will return \"Hello\""]$seed$::jsonb, 0),
('ee000000-0000-0000-0000-000000000034', 'cc000000-0000-0000-0000-000000000003',
 $seed$Ո՞ր բառը օգտագործվում է դաս ստեղծելու համար։$seed$, $seed$Which keyword is used to create a class?$seed$,
 $seed$["object","class","struct","type"]$seed$::jsonb,
 $seed$["object","class","struct","type"]$seed$::jsonb, 1),
('ee000000-0000-0000-0000-000000000035', 'cc000000-0000-0000-0000-000000000003',
 $seed$Ինչ է namespace-ը C#-ում։$seed$, $seed$What is namespace in C#?$seed$,
 $seed$["Փոփոխականի անուն","Դասերի խմբավորման մեթոդ","Տվյալների տիպ","Օպերատոր"]$seed$::jsonb,
 $seed$["Variable name","Method for grouping classes","Data type","Operator"]$seed$::jsonb, 1),
-- HTML
('ee000000-0000-0000-0000-000000000041', 'cc000000-0000-0000-0000-000000000004',
 $seed$Ի՞նչ նշանակում է HTML-ը։$seed$, $seed$What does HTML stand for?$seed$,
 $seed$["HyperText Markup Language","HighText Machine Language","HyperText Making Language","HomeText Markup Language"]$seed$::jsonb,
 $seed$["HyperText Markup Language","HighText Machine Language","HyperText Making Language","HomeText Markup Language"]$seed$::jsonb, 0),
('ee000000-0000-0000-0000-000000000042', 'cc000000-0000-0000-0000-000000000004',
 $seed$Ո՞ր թեգն է օգտագործվում վերնագրի համար։$seed$, $seed$Which tag is used for a heading?$seed$,
 $seed$["<header>","<h1>","<title>","<head>"]$seed$::jsonb,
 $seed$["<header>","<h1>","<title>","<head>"]$seed$::jsonb, 1),
('ee000000-0000-0000-0000-000000000043', 'cc000000-0000-0000-0000-000000000004',
 $seed$Ինչպե՞ս ստեղծել հղում HTML-ում։$seed$, $seed$How to create a link in HTML?$seed$,
 $seed$["<link href=\"url\">","<a href=\"url\">","<url href=\"link\">","<href=\"url\">"]$seed$::jsonb,
 $seed$["<link href=\"url\">","<a href=\"url\">","<url href=\"link\">","<href=\"url\">"]$seed$::jsonb, 1),
('ee000000-0000-0000-0000-000000000044', 'cc000000-0000-0000-0000-000000000004',
 $seed$Ո՞ր թեգն է օգտագործվում նկար ավելացնելու համար։$seed$, $seed$Which tag is used to add an image?$seed$,
 $seed$["<image>","<img>","<picture>","<photo>"]$seed$::jsonb,
 $seed$["<image>","<img>","<picture>","<photo>"]$seed$::jsonb, 1),
('ee000000-0000-0000-0000-000000000045', 'cc000000-0000-0000-0000-000000000004',
 $seed$Որտե՞ղ է գրվում CSS ոճը HTML փաստաթղթում։$seed$, $seed$Where is CSS style written in an HTML document?$seed$,
 $seed$["<style> թեգի մեջ","<css> թեգի մեջ","<script> թեգի մեջ","<link> թեգի մեջ միայն"]$seed$::jsonb,
 $seed$["In <style> tag","In <css> tag","In <script> tag","Only in <link> tag"]$seed$::jsonb, 0)
on conflict (id) do nothing;


-- ============================================================================
-- 7. MAKE YOURSELF AN ADMIN  (run AFTER you have created your account)
-- ----------------------------------------------------------------------------
-- This does nothing until an account with your email exists. It's commented
-- out so it doesn't run by accident. Uncomment + run it once you've signed up.
--
-- update public.profiles
-- set role = 'admin'
-- where id = (select id from auth.users where email = 'tigran@getstarshunt.com');
-- ============================================================================
