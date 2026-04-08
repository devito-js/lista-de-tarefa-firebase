// Importa a configuração do Firebase (deve ser o mesmo config.js da lista de tarefas)
import { firebaseConfig } from './config.js';

// Importa as funções necessárias do SDK do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { 
    getFirestore, 
    doc,
    getDoc 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// --- INICIALIZAÇÃO DO FIREBASE ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- REFERÊNCIAS DO DOM ---
const loginView = document.getElementById('login-view');
const welcomeView = document.getElementById('welcome-view');
const appContainer = document.getElementById('app-container');

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');

const errorMessage = document.getElementById('error-message');
const welcomeMessage = document.getElementById('welcome-message');
const userEmail = document.getElementById('user-email');
const userColor = document.getElementById('user-color');

// --- FUNÇÕES ---

/**
 * Busca a cor do usuário no Firestore e atualiza a UI.
 * @param {string} uid - O UID do usuário logado.
 */
const fetchUserColor = async (uid) => {
    try {
        const userDocRef = doc(db, "cores", uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const colorRGB = userData.cor;

            if (colorRGB) {
                document.body.style.backgroundColor = `rgb(${colorRGB})`;
                userColor.textContent = `rgb(${colorRGB})`;
            } else {
                showError('O campo \"cor\" não foi encontrado no seu documento.');
                userColor.textContent = 'Não definida';
            }
        } else {
            showError('Seu documento de usuário não foi encontrado no Firestore.');
            userColor.textContent = 'Não encontrado';
        }
    } catch (error) {
        console.error("Erro ao buscar dados do Firestore: ", error);
        showError("Ocorreu um erro ao buscar sua cor.");
    }
};

/**
 * Atualiza a UI para o estado de "logado".
 * @param {object} user - O objeto do usuário do Firebase Auth.
 */
const showWelcomeScreen = (user) => {
    welcomeMessage.textContent = `Login realizado com sucesso!`;
    userEmail.textContent = user.email;
    
    fetchUserColor(user.uid);

    loginView.classList.add('hidden');
    welcomeView.classList.remove('hidden');
};

/**
 * Atualiza a UI para o estado de "deslogado".
 */
const showLoginScreen = () => {
    document.body.style.backgroundColor = '#eef1f5'; // Reseta a cor de fundo
    passwordInput.value = ''; // Limpa a senha por segurança
    errorMessage.textContent = ''; // Limpa mensagens de erro

    welcomeView.classList.add('hidden');
    loginView.classList.remove('hidden');
};

/**
 * Exibe uma mensagem de erro na tela de login.
 * @param {string} message - A mensagem a ser exibida.
 */
const showError = (message) => {
    errorMessage.textContent = message;
};

// --- LÓGICA DE EVENTOS ---

// Evento de clique no botão de login
loginBtn.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    if (!email || !password) {
        showError("Por favor, preencha o e-mail e a senha.");
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email, password);
        // O onAuthStateChanged vai cuidar de mostrar a tela de boas-vindas.
    } catch (error) {
        console.error("Erro de login: ", error.code);
        // Mapeia códigos de erro do Firebase para mensagens amigáveis
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                showError("E-mail ou senha inválidos.");
                break;
            case 'auth/invalid-email':
                showError("O formato do e-mail é inválido.");
                break;
            default:
                showError("Ocorreu um erro ao tentar fazer login.");
                break;
        }
    }
});

// Evento de clique no botão de logout
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        // O onAuthStateChanged vai cuidar de mostrar a tela de login.
    } catch (error) {
        console.error("Erro ao sair: ", error);
    }
});

// Observador do estado de autenticação
onAuthStateChanged(auth, (user) => {
    if (user) {
        // O usuário está logado
        showWelcomeScreen(user);
    } else {
        // O usuário está deslogado
        showLoginScreen();
    }
});