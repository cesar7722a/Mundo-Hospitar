function Header({ ativo = "Home" } = {}) {
  const links = [
    { nome: "Home", href: "index.html" },
    { nome: "Sobre nós", href: "sobre_nos.html" },
    { nome: "Doutores", href: "dotores.html" },
    { nome: "Serviços", href: "servico.html" },
  ];

  return `
    <header class="header">
      <a href="index.html" class="logo">
        <span>Mundo</span>-Hospitalar
      </a>

      <div class="menu">
        <nav>
          <ul>
            ${links
              .map(
                (link) => `
              <li>
                <a
                  href="${link.href}"
                  ${link.nome === ativo ? 'aria-current="page"' : ""}
                >${link.nome}</a>
              </li>
            `,
              )
              .join("")}
          </ul>
        </nav>

        <button class="bt-login">Login</button>
      </div>
    </header>
  `;
}

export default Header();
