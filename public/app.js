// Importa a configuração do Firebase
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
    collection, 
    doc,
    getDoc,
    getDocs,
    addDoc, 
    onSnapshot,
    query,
    orderBy,
    deleteDoc, 
    updateDoc,
    writeBatch
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// --- INICIALIZAÇÃO DO FIREBASE ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- REFERÊNCIAS GLOBAIS DO DOM ---
const loginView = document.getElementById('login-view');
const appView = document.getElementById('app-view');

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const errorMessage = document.getElementById('error-message');

const welcomeUser = document.getElementById('welcome-user');
const logoutBtn = document.getElementById('logout-btn');
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const notificationContainer = document.getElementById('notification-container');

// --- VARIÁVEIS DE ESTADO ---
let currentUser = null;
let tasksCollectionRef = null; 
let unsubscribeTasks = null; 

// --- FUNÇÕES DE UI ---

const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notificationContainer.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
};

const showLoginScreen = () => {
    document.body.style.backgroundColor = '#eef1f5';
    appView.classList.add('hidden');
    loginView.classList.remove('hidden');
};

const showAppScreen = async (user) => {
    const userDocRef = doc(db, "cores", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        welcomeUser.textContent = `Olá, ${userData.nome || 'Usuário'}!`;
        if (userData.cor) {
            document.body.style.backgroundColor = `rgb(${userData.cor})`;
        }
    } else {
        welcomeUser.textContent = `Bem-vindo!`;
        showNotification('Documento de usuário não encontrado.', 'danger');
    }

    loginView.classList.add('hidden');
    appView.classList.remove('hidden');
};

const showError = (message) => {
    errorMessage.textContent = message;
};

// --- LÓGICA DE AUTENTICAÇÃO ---

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        tasksCollectionRef = collection(db, "cores", user.uid, "tarefas");
        showAppScreen(user);
        listenForTasks();
        initializeSortable();
    } else {
        currentUser = null;
        if (unsubscribeTasks) unsubscribeTasks();
        tasksCollectionRef = null;
        showLoginScreen();
        taskList.innerHTML = ''; 
    }
});

loginBtn.addEventListener('click', async () => {
    errorMessage.textContent = '';
    try {
        await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
    } catch (error) {
        showError("E-mail ou senha inválidos.");
        console.error("Login error:", error.code);
    }
});

logoutBtn.addEventListener('click', () => {
    signOut(auth);
});

// --- LÓGICA DA LISTA DE TAREFAS ---

const listenForTasks = () => {
    if (!tasksCollectionRef) return;
    const q = query(tasksCollectionRef, orderBy("order"));
    unsubscribeTasks = onSnapshot(q, (snapshot) => {
        const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderTasks(tasks);
    });
};

const renderTasks = (tasks) => {
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.setAttribute('data-id', task.id);
        if (task.completed) {
            li.classList.add('completed');
        }

        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <div class="drag-handle"><i class="fa-solid fa-grip-vertical"></i></div>
            <span>${task.text}</span>
            <input type="text" class="edit-input hidden" value="${task.text}">
            <div class="task-buttons">
                <button class="edit-btn"><i class="fa-solid fa-pencil"></i></button>
                <button class="save-btn hidden"><i class="fa-solid fa-save"></i></button>
                <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        taskList.appendChild(li);
    });
};

addTaskBtn.addEventListener('click', async () => {
    const taskText = taskInput.value.trim();
    if (taskText && tasksCollectionRef) {
        try {
            const querySnapshot = await getDocs(tasksCollectionRef);
            const count = querySnapshot.size;

            await addDoc(tasksCollectionRef, { 
                text: taskText, 
                createdAt: new Date(), 
                order: count, 
                completed: false 
            });
            taskInput.value = '';
            showNotification('Tarefa adicionada!', 'success');
        } catch (error) {
            console.error("Error adding task: ", error);
            showNotification('Erro ao adicionar tarefa.', 'danger');
        }
    }
});

taskList.addEventListener('click', (event) => {
    const target = event.target;
    const li = target.closest('li');
    if (!li) return;

    const taskId = li.getAttribute('data-id');
    const taskRef = doc(tasksCollectionRef, taskId);

    // Lógica do Checkbox
    if (target.matches('.task-checkbox')) {
        const isCompleted = target.checked;
        updateDoc(taskRef, { completed: isCompleted }).then(() => {
            showNotification(isCompleted ? 'Tarefa concluída!' : 'Tarefa reativada!', 'info');
        });
        return;
    }

    // Lógica dos Botões
    const button = target.closest('button');
    if (!button) return;
    
    const span = li.querySelector('span');
    const input = li.querySelector('.edit-input');
    const editBtn = li.querySelector('.edit-btn');
    const saveBtn = li.querySelector('.save-btn');

    if (button.classList.contains('delete-btn')) {
        deleteDoc(taskRef).then(() => showNotification('Tarefa excluída.', 'danger'));
    } else if (button.classList.contains('edit-btn')) {
        span.classList.add('hidden');
        input.classList.remove('hidden');
        editBtn.classList.add('hidden');
        saveBtn.classList.remove('hidden');
        input.focus();
    } else if (button.classList.contains('save-btn')) {
        const newText = input.value.trim();
        if (newText && newText !== span.textContent) {
            updateDoc(taskRef, { text: newText }).then(() => {
                showNotification('Tarefa atualizada.', 'info');
            });
        }
        span.classList.remove('hidden');
        input.classList.add('hidden');
        editBtn.classList.remove('hidden');
        saveBtn.classList.add('hidden');
    }
});

const initializeSortable = () => {
    if (taskList.sorter) {
      taskList.sorter.destroy();
    }
    
    taskList.sorter = new Sortable(taskList, {
        handle: '.drag-handle',
        animation: 150,
        onEnd: async () => {
            const batch = writeBatch(db);
            const taskItems = taskList.querySelectorAll('li');
            taskItems.forEach((task, index) => {
                const taskId = task.getAttribute('data-id');
                const taskRef = doc(tasksCollectionRef, taskId);
                batch.update(taskRef, { order: index });
            });
            await batch.commit();
            showNotification('Ordem atualizada!', 'info');
        }
    });
};
