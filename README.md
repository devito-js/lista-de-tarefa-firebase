# Lista de Tarefas com Firebase

## 📖 Descrição

Esta é uma aplicação web simples de "Lista de Tarefas" (To-Do List) desenvolvida com HTML, CSS e JavaScript puros. A aplicação utiliza o Google Firebase (Firestore) como banco de dados em tempo real, permitindo que as tarefas sejam sincronizadas e ordenadas instantaneamente.

A interface é limpa, moderna e responsiva, e o aplicativo fornece feedback ao usuário por meio de notificações para cada ação (criar, editar, excluir, reordenar).

## ✨ Funcionalidades

- **CRUD Completo:** Crie, Leia, Atualize e Exclua tarefas.
- **Arrastar e Soltar (Drag and Drop):** Reordene as tarefas facilmente arrastando-as para a posição desejada.
- **Persistência da Ordem:** A ordem das tarefas é salva no Firestore.
- **Sincronização em Tempo Real:** As alterações são refletidas instantaneamente com o Firebase Firestore.
- **Interface Intuitiva:** Design moderno com ícones (Font Awesome) para facilitar a interação.
- **Notificações Visuais:** O usuário é notificado sobre cada tarefa criada, editada ou excluída.
- **Segurança de Credenciais:** As chaves da API do Firebase são mantidas em um arquivo separado e ignoradas pelo Git.

## 🛠️ Tecnologias Utilizadas

- **HTML5:** Estrutura da página.
- **CSS3:** Estilização, layout responsivo e animações.
- **JavaScript (ES Modules):** Lógica da aplicação e manipulação do DOM.
- **Google Firebase:**
    - **Firestore:** Banco de dados NoSQL para armazenar as tarefas.
- **SortableJS:** Biblioteca para funcionalidade de arrastar e soltar.
- **Font Awesome:** Biblioteca de ícones.
- **Google Fonts:** Para a tipografia (Roboto).

## 🚀 Como Executar o Projeto

Para executar este projeto localmente, siga os passos abaixo:

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
    cd SEU_REPOSITORIO
    ```

2.  **Crie um Projeto no Firebase:**
    - Acesse o [console do Firebase](https://console.firebase.google.com/).
    - Crie um novo projeto e adicione um aplicativo Web a ele.
    - O Firebase fornecerá um objeto de configuração `firebaseConfig`. Você precisará dele no próximo passo.

3.  **Configure as Credenciais:**
    - Na pasta `public`, você encontrará um arquivo chamado `config.example.js`.
    - Crie uma cópia deste arquivo e renomeie-a para `config.js`.
    - Abra o `public/config.js` e cole o objeto `firebaseConfig` que você obteve do Firebase.

    Seu `public/config.js` deve ficar assim:
    ```javascript
    const firebaseConfig = {
        apiKey: "SUA_API_KEY",
        authDomain: "SEU_AUTH_DOMAIN",
        projectId: "SEU_PROJECT_ID",
        storageBucket: "SEU_STORAGE_BUCKET",
        messagingSenderId: "SEU_MESSAGING_SENDER_ID",
        appId: "SEU_APP_ID"
    };

    export { firebaseConfig };
    ```

4.  **Abra no Navegador:**
    - Simplesmente abra o arquivo `public/index.html` em seu navegador. Para que os módulos JavaScript funcionem corretamente, talvez seja necessário servir os arquivos a partir de um servidor local (você pode usar a extensão "Live Server" no VS Code, por exemplo).

## 🗂️ Estrutura do Projeto

```
/
├── .gitignore         # Ignora arquivos que não devem ir para o Git (como config.js)
├── README.md          # Este arquivo
└── public/
    ├── app.js             # Lógica JavaScript da aplicação
    ├── config.js          # (Ignorado pelo Git) Suas credenciais do Firebase
    ├── config.example.js  # Arquivo de exemplo para a configuração
    ├── index.html         # Estrutura principal da página
    └── style.css          # Estilos da aplicação
```
