/**
 * Сплит-лейаут для auth-страниц. Панель и форма собираются в page-компонентах,
 * этот layout лишь передаёт детей (заготовка под общий фон/анимации).
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
