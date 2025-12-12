import { Course } from '../types/course';

export const getInitialCourses = (language: 'hy' | 'en'): Course[] => {
  if (language === 'hy') {
    return [
      {
        id: 'sql',
        title: 'SQL Տվյալների բազաներ',
            description: 'Սովորեք SQL լեզուն և տվյալների բազաների կառավարումը։ Ծանոթացեք SELECT, INSERT, UPDATE հրամաններին։',
  
            pdfContent:
        `
        SQL Տվյալների բազաներ - Ներածություն....\n
      
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
SQL-ը հզոր գործիք է տվյալների բազաների կառավարման համար։ Այն թույլ է տալիս արդյունավետ աշխատել տվյալների հետ։`,
            videos: [
                "https://youtu.be/7S_tz1z_5bA?si=XBoBvcDsuXleY18f",
              
            ],
        quiz: [
          {
            question: 'Ի՞նչ է SQL-ը։',
            options: [
              'Ծրագրավորման լեզու',
              'Տվյալների բազաների կառավարման համակարգ',
              'Կառուցվածքային հարցումների լեզու',
              'Օպերացիոն համակարգ'
            ],
            correctAnswer: 2
          },
          {
            question: 'Ո՞ր հրամանն է օգտագործվում տվյալներ ընտրելու համար։',
            options: ['INSERT', 'SELECT', 'UPDATE', 'DELETE'],
            correctAnswer: 1
          },
          {
            question: 'Ինչպե՞ս կավելացնենք նոր տող աղյուսակում։',
            options: ['SELECT', 'UPDATE', 'INSERT', 'CREATE'],
            correctAnswer: 2
          },
          {
            question: 'Ո՞ր հրամանով կարող ենք թարմացնել տվյալները։',
            options: ['UPDATE', 'MODIFY', 'CHANGE', 'ALTER'],
            correctAnswer: 0
          },
          {
            question: 'Ինչու՞ է օգտագործվում PRIMARY KEY-ը։',
            options: [
              'Տվյալների դասակարգման համար',
              'Յուրաքանչյուր տողի եզակի նույնականացման համար',
              'Տվյալների ջնջման համար',
              'Աղյուսակի անվան համար'
            ],
            correctAnswer: 1
          }
        ]
      },
      {
        id: 'python',
        title: 'Python Ծրագրավորում',
        description: 'Տիրապետեք Python լեզվին՝ սկսած հիմունքներից մինչև առաջադեմ թեմաներ։',
          pdfContent: `
        Python Ծրագրավորում - Հիմունքներ

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
Python-ը հարմար է սկսնակների համար և լայնորեն օգտագործվում է ինչպես վեբ մշակման, այնպես էլ տվյալների վերլուծության մեջ։`,
          videos:  ["https://youtu.be/K5KVEU3aaeQ?si=CexfO_OqhxI1bx47 "
          ] ,
        quiz: [
          {
            question: 'Ինչպե՞ս է հայտարարվում փոփոխական Python-ում։',
            options: [
              'var x = 5',
              'int x = 5',
              'x = 5',
              'let x = 5'
            ],
            correctAnswer: 2
          },
          {
            question: 'Ո՞ր տվյալների տիպը չի գոյություն ունենում Python-ում։',
            options: ['int', 'string', 'char', 'list'],
            correctAnswer: 2
          },
          {
            question: 'Ինչպե՞ս սահմանել ֆունկցիա Python-ում։',
            options: [
              'function myFunc():',
              'def myFunc():',
              'func myFunc():',
              'define myFunc():'
            ],
            correctAnswer: 1
          },
          {
            question: 'Ինչ կլինի print(type(5)) հրամանի արդյունքը։',
            options: [
              "<class 'int'>",
              "<class 'number'>",
              'integer',
              'int'
            ],
            correctAnswer: 0
          },
          {
            question: 'Ո՞ր օպերատորն է օգտագործվում բաժանման մնացորդը գտնելու համար։',
            options: ['/', '%', '//', 'mod'],
            correctAnswer: 1
          }
        ]
      },
      {
        id: 'csharp',
        title: 'C# Ծրագրավորում',
        description: 'Սովորեք C# լեզուն և .NET շրջակայքը ժամանակակից ծրագրեր ստեղծելու համար։',
        pdfContent: `C# Ծրագրավորում - Հիմունքներ

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
C#-ը հզոր լեզու է Windows հավելվածների, խաղերի (Unity) և վեբ ծառայությունների ստեղծման համար։`,
          videos:[],
        quiz: [
          {
            question: 'Ո՞վ է մշակել C# լեզուն։',
            options: ['Google', 'Apple', 'Microsoft', 'Oracle'],
            correctAnswer: 2
          },
          {
            question: 'Ինչպե՞ս է հայտարարվում մեթոդը C#-ում։',
            options: [
              'def Method():',
              'function Method()',
              'public void Method()',
              'method Method()'
            ],
            correctAnswer: 2
          },
          {
            question: 'Ինչ կլինի Console.WriteLine("Hello"); հրամանի արդյունքը։',
            options: [
              'Կտպի "Hello" էկրանին',
              'Կստեղծի սխալ',
              'Ոչինչ չի տպի',
              'Կվերադարձնի "Hello"'
            ],
            correctAnswer: 0
          },
          {
            question: 'Ո՞ր բառը օգտագործվում է դաս ստեղծելու համար։',
            options: ['object', 'class', 'struct', 'type'],
            correctAnswer: 1
          },
          {
            question: 'Ինչ է namespace-ը C#-ում։',
            options: [
              'Փոփոխականի անուն',
              'Դասերի խմբավորման մեթոդ',
              'Տվյալների տիպ',
              'Օպերատոր'
            ],
            correctAnswer: 1
          }
        ]
      },
      {
        id: 'html',
        title: 'HTML և Վեբ Զարգացում',
        description: 'Ստեղծեք վեբ էջեր HTML-ի և CSS-ի միջոցով։ Սովորեք վեբ դիզայնի հիմունքները։',
        pdfContent: `HTML և Վեբ Զարգացում - Հիմունքներ

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
HTML-ը վեբ էջերի հիմքն է։ CSS-ի և JavaScript-ի հետ միասին թույլ է տալիս ստեղծել գեղեցիկ և ինտերակտիվ կայքեր։`,
videos:[],
        quiz: [
          {
            question: 'Ի՞նչ նշանակում է HTML-ը։',
            options: [
              'HyperText Markup Language',
              'HighText Machine Language',
              'HyperText Making Language',
              'HomeText Markup Language'
            ],
            correctAnswer: 0
          },
          {
            question: 'Ո՞ր թեգն է օգտագործվում վերնագրի համար։',
            options: ['<header>', '<h1>', '<title>', '<head>'],
            correctAnswer: 1
          },
          {
            question: 'Ինչպե՞ս ստեղծել հղում HTML-ում։',
            options: [
              '<link href="url">',
              '<a href="url">',
              '<url href="link">',
              '<href="url">'
            ],
            correctAnswer: 1
          },
          {
            question: 'Ո՞ր թեգն է օգտագործվում նկար ավելացնելու համար։',
            options: ['<image>', '<img>', '<picture>', '<photo>'],
            correctAnswer: 1
          },
          {
            question: 'Որտե՞ղ է գրվում CSS ոճը HTML փաստաթղթում։',
            options: [
              '<style> թեգի մեջ',
              '<css> թեգի մեջ',
              '<script> թեգի մեջ',
              '<link> թեգի մեջ միայն'
            ],
            correctAnswer: 0
          }
        ]
      }
    ];
  } else {
    return [
      {
        id: 'sql',
        title: 'SQL Databases',
        description: 'Learn SQL language and database management. Get familiar with SELECT, INSERT, UPDATE commands.',
        pdfContent: `SQL Databases - Introduction

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
SQL is a powerful tool for database management. It allows efficient work with data.`,
        quiz: [
          {
            question: 'What is SQL?',
            options: [
              'A programming language',
              'A database management system',
              'A structured query language',
              'An operating system'
            ],
            correctAnswer: 2
          },
          {
            question: 'Which command is used to retrieve data?',
            options: ['INSERT', 'SELECT', 'UPDATE', 'DELETE'],
            correctAnswer: 1
          },
          {
            question: 'How do we add a new row to a table?',
            options: ['SELECT', 'UPDATE', 'INSERT', 'CREATE'],
            correctAnswer: 2
          },
          {
            question: 'Which command can update data?',
            options: ['UPDATE', 'MODIFY', 'CHANGE', 'ALTER'],
            correctAnswer: 0
          },
          {
            question: 'Why is PRIMARY KEY used?',
            options: [
              'For data sorting',
              'For unique identification of each row',
              'For data deletion',
              'For table naming'
            ],
            correctAnswer: 1
          }
        ]
      },
      {
        id: 'python',
        title: 'Python Programming',
        description: 'Master Python language from basics to advanced topics.',
        pdfContent: `Python Programming - Basics

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
Python is suitable for beginners and widely used in both web development and data analysis.`,
        quiz: [
          {
            question: 'How is a variable declared in Python?',
            options: [
              'var x = 5',
              'int x = 5',
              'x = 5',
              'let x = 5'
            ],
            correctAnswer: 2
          },
          {
            question: 'Which data type does not exist in Python?',
            options: ['int', 'string', 'char', 'list'],
            correctAnswer: 2
          },
          {
            question: 'How to define a function in Python?',
            options: [
              'function myFunc():',
              'def myFunc():',
              'func myFunc():',
              'define myFunc():'
            ],
            correctAnswer: 1
          },
          {
            question: 'What will be the result of print(type(5))?',
            options: [
              "<class 'int'>",
              "<class 'number'>",
              'integer',
              'int'
            ],
            correctAnswer: 0
          },
          {
            question: 'Which operator is used to find the remainder of division?',
            options: ['/', '%', '//', 'mod'],
            correctAnswer: 1
          }
        ]
      },
      {
        id: 'csharp',
        title: 'C# Programming',
        description: 'Learn C# language and .NET framework to create modern applications.',
        pdfContent: `C# Programming - Basics

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
C# is a powerful language for creating Windows applications, games (Unity), and web services.`,
        quiz: [
          {
            question: 'Who developed the C# language?',
            options: ['Google', 'Apple', 'Microsoft', 'Oracle'],
            correctAnswer: 2
          },
          {
            question: 'How is a method declared in C#?',
            options: [
              'def Method():',
              'function Method()',
              'public void Method()',
              'method Method()'
            ],
            correctAnswer: 2
          },
          {
            question: 'What will be the result of Console.WriteLine("Hello");?',
            options: [
              'Will print "Hello" to the screen',
              'Will create an error',
              'Will print nothing',
              'Will return "Hello"'
            ],
            correctAnswer: 0
          },
          {
            question: 'Which keyword is used to create a class?',
            options: ['object', 'class', 'struct', 'type'],
            correctAnswer: 1
          },
          {
            question: 'What is namespace in C#?',
            options: [
              'Variable name',
              'Method for grouping classes',
              'Data type',
              'Operator'
            ],
            correctAnswer: 1
          }
        ]
      },
      {
        id: 'html',
        title: 'HTML & Web Development',
        description: 'Create web pages using HTML and CSS. Learn web design fundamentals.',
        pdfContent: `HTML & Web Development - Basics

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
HTML is the foundation of web pages. Together with CSS and JavaScript, it allows creating beautiful and interactive websites.`,
        quiz: [
          {
            question: 'What does HTML stand for?',
            options: [
              'HyperText Markup Language',
              'HighText Machine Language',
              'HyperText Making Language',
              'HomeText Markup Language'
            ],
            correctAnswer: 0
          },
          {
            question: 'Which tag is used for a heading?',
            options: ['<header>', '<h1>', '<title>', '<head>'],
            correctAnswer: 1
          },
          {
            question: 'How to create a link in HTML?',
            options: [
              '<link href="url">',
              '<a href="url">',
              '<url href="link">',
              '<href="url">'
            ],
            correctAnswer: 1
          },
          {
            question: 'Which tag is used to add an image?',
            options: ['<image>', '<img>', '<picture>', '<photo>'],
            correctAnswer: 1
          },
          {
            question: 'Where is CSS style written in an HTML document?',
            options: [
              'In <style> tag',
              'In <css> tag',
              'In <script> tag',
              'Only in <link> tag'
            ],
            correctAnswer: 0
          }
        ]
      }
    ];
  }
};
