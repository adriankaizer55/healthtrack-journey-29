const RULES: Array<[RegExp, string]> = [
  [/invalid login credentials/i, "E-mail ou senha inválidos."],
  [/email not confirmed/i, "Confirme seu e-mail antes de entrar."],
  [/password is known to be weak/i, "Essa senha é muito fraca e fácil de adivinhar. Escolha outra."],
  [/password should be at least (\d+)/i, "A senha precisa ter pelo menos $1 caracteres."],
  [/(user already registered|already registered|already been registered)/i, "Este e-mail já está cadastrado."],
  [/unable to validate email address|invalid email/i, "Informe um e-mail válido."],
  [/(email rate limit exceeded|over_email_send_rate_limit)/i, "Muitos e-mails enviados. Aguarde alguns minutos e tente novamente."],
  [/for security purposes, you can only request this after (\d+) seconds?/i, "Por segurança, tente novamente em $1 segundos."],
  [/request rate limit reached|too many requests/i, "Muitas tentativas. Aguarde um momento e tente novamente."],
  [/new password should be different/i, "A nova senha precisa ser diferente da anterior."],
  [/token has expired or is invalid|invalid token|otp_expired/i, "O link expirou ou é inválido. Solicite um novo."],
  [/(user not found|no user found)/i, "Usuário não encontrado."],
  [/signups? not allowed|signup is disabled/i, "Cadastros estão desativados no momento."],
  [/unsupported provider/i, "Este método de login não está disponível."],
  [/session (from session_id claim in jwt )?does not exist|session expired|jwt expired/i, "Sua sessão expirou. Entre novamente."],
  [/(failed to fetch|network ?error|load failed)/i, "Falha de conexão. Verifique sua internet e tente novamente."],
  [/email link is invalid or has expired/i, "O link de e-mail é inválido ou expirou. Solicite um novo."],
  [/anonymous sign-?ins are disabled/i, "Login anônimo está desativado."],
  [/database error/i, "Erro no servidor. Tente novamente em instantes."],
];

/** Traduz mensagens de erro de autenticação/backend para português. */
export function translateAuthError(message?: string | null): string {
  const raw = (message ?? "").trim();
  if (!raw) return "Algo deu errado. Tente novamente.";
  for (const [pattern, pt] of RULES) {
    const match = raw.match(pattern);
    if (match) return pt.replace(/\$(\d)/g, (_, i) => match[Number(i)] ?? "");
  }
  // Se já parece português, mantém.
  if (/[áàâãéêíóôõúç]/i.test(raw) || /\b(senha|e-?mail|usuário|conta)\b/i.test(raw)) return raw;
  return "Não foi possível concluir a ação. Tente novamente.";
}
