// Maps Supabase Auth's English error messages to friendly bilingual text.
// Falls back to the raw message for anything we don't specifically handle.
export function mapAuthError(message: string, language: 'hy' | 'en'): string {
  const m = message.toLowerCase();

  if (m.includes('invalid login credentials')) {
    return language === 'hy' ? 'Սխալ էլ․ հասցե կամ գաղտնաբառ' : 'Invalid email or password';
  }
  if (m.includes('email not confirmed')) {
    return language === 'hy'
      ? 'Նախ հաստատեք ձեր էլ․ հասցեն (ստուգեք ձեր փոստը)'
      : 'Please confirm your email first (check your inbox)';
  }
  if (m.includes('already registered') || m.includes('already been registered') || m.includes('user already')) {
    return language === 'hy' ? 'Այս էլ․ հասցեն արդեն գրանցված է' : 'This email is already registered';
  }
  if (m.includes('password should be at least') || m.includes('weak password')) {
    return language === 'hy'
      ? 'Գաղտնաբառը պետք է լինի առնվազն 6 նիշ'
      : 'Password must be at least 6 characters';
  }
  if (m.includes('rate limit') || m.includes('too many') || m.includes('for security purposes')) {
    return language === 'hy'
      ? 'Չափազանց շատ փորձեր։ Փորձեք մի փոքր ուշ։'
      : 'Too many attempts. Please try again shortly.';
  }
  if (m.includes('unable to validate email address') || m.includes('invalid email')) {
    return language === 'hy' ? 'Մուտքագրեք ճիշտ էլ․ հասցե' : 'Please enter a valid email';
  }

  return message;
}
