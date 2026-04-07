// Importa a configuracao do Firebase de um arquivo externo.
import { firebaseConfig } from './config.js';

// Importa as funcoes necessarias do SDK do Firebase.
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    onSnapshot, 
    deleteDoc, 
    doc,
    updateDoc 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Inicializa o aplicativo do Firebase com as configuracoes importadas.
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Referencias para os elementos do DOM.
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const notificationContainer = document.getElementById('notification-container');

/**
 * Exibe uma notificacao na tela.
 * @param {string} message - A mensagem a ser exibida.
 * @param {string} type - O tipo de notificacao (success, info, danger).
 */
const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    notificationContainer.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
};

// Adiciona uma nova tarefa ao Firestore.
const addTask = async () => {
    const taskText = taskInput.value.trim();
    if (taskText) {
        try {
            await addDoc(collection(db, "tarefas"), {
                text: taskText,
                createdAt: new Date()
            });
            taskInput.value = '';
            showNotification('Tarefa adicionada com sucesso!', 'success');
        } catch (error) {
            console.error("Erro ao adicionar tarefa: ", error);
            showNotification('Erro ao adicionar tarefa.', 'danger');
        }
    }
};

// Exclui uma tarefa do Firestore.
const deleteTask = async (id) => {
    try {
        await deleteDoc(doc(db, "tarefas", id));
        showNotification('Tarefa excluída com sucesso!', 'danger');
    } catch (error) {
        console.error("Erro ao excluir tarefa: ", error);
        showNotification('Erro ao excluir tarefa.', 'danger');
    }
};

// Atualiza o texto de uma tarefa no Firestore.
const updateTask = async (id, newText) => {
    try {
        await updateDoc(doc(db, "tarefas", id), {
            text: newText
        });
        showNotification('Tarefa atualizada com sucesso!', 'info');
    } catch (error) {
        console.error("Erro ao atualizar tarefa: ", error);
        showNotification('Erro ao atualizar tarefa.', 'danger');
    }
};

// Renderiza a lista de tarefas na tela.
const renderTasks = (tasks) => {
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.setAttribute('data-id', task.id);

        const span = document.createElement('span');
        span.textContent = task.text;

        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.value = task.text;
        editInput.className = 'edit-input hidden';

        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'task-buttons';

        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.innerHTML = '<i class="fa-solid fa-pencil"></i>';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';

        const saveBtn = document.createElement('button');
        saveBtn.className = 'save-btn hidden';
        saveBtn.innerHTML = '<i class="fa-solid fa-save"></i>';

        buttonsDiv.appendChild(editBtn);
        buttonsDiv.appendChild(saveBtn);
        buttonsDiv.appendChild(deleteBtn);

        li.appendChild(span);
        li.appendChild(editInput);
        li.appendChild(buttonsDiv);
        taskList.appendChild(li);
    });
};

// Adiciona "ouvintes" de eventos.
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        addTask();
    }
});

// Delegação de eventos para os botões de ação na lista de tarefas.
taskList.addEventListener('click', (event) => {
    const target = event.target.closest('button');
    if (!target) return;

    const li = target.closest('li');
    const taskId = li.getAttribute('data-id');
    const span = li.querySelector('span');
    const input = li.querySelector('.edit-input');
    const editBtn = li.querySelector('.edit-btn');
    const saveBtn = li.querySelector('.save-btn');

    if (target.classList.contains('delete-btn')) {
        deleteTask(taskId);
    } else if (target.classList.contains('edit-btn')) {
        span.classList.add('hidden');
        input.classList.remove('hidden');
        editBtn.classList.add('hidden');
        saveBtn.classList.remove('hidden');
        input.focus();
    } else if (target.classList.contains('save-btn')) {
        const newText = input.value.trim();
        if (newText) {
            updateTask(taskId, newText);
        } else {
            input.value = span.textContent;
            span.classList.remove('hidden');
            input.classList.add('hidden');
            editBtn.classList.remove('hidden');
            saveBtn.classList.add('hidden');
        }
    }
});

// Escuta por atualizacoes em tempo real na colecao "tarefas".
onSnapshot(collection(db, "tarefas"), (snapshot) => {
    const tasks = [];
    snapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() });
    });
    tasks.sort((a, b) => a.createdAt.toDate() - b.createdAt.toDate());
    renderTasks(tasks);
});