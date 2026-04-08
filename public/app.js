// Importa a configuracao do Firebase de um arquivo externo.
import { firebaseConfig } from './config.js';

// Importa as funcoes necessarias do SDK do Firebase.
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    onSnapshot,
    query,
    orderBy,
    deleteDoc, 
    doc,
    updateDoc,
    writeBatch,
    getCount
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Inicializa o aplicativo do Firebase com as configuracoes importadas.
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const tasksCollection = collection(db, "tarefas");

// Referencias para os elementos do DOM.
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const notificationContainer = document.getElementById('notification-container');

/**
 * Exibe uma notificacao na tela.
 */
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

/**
 * Adiciona uma nova tarefa ao Firestore.
 */
const addTask = async () => {
    const taskText = taskInput.value.trim();
    if (taskText) {
        try {
            const snapshot = await getCount(tasksCollection);
            const count = snapshot.data().count;

            await addDoc(tasksCollection, {
                text: taskText,
                createdAt: new Date(),
                order: count
            });
            taskInput.value = '';
            showNotification('Tarefa adicionada com sucesso!', 'success');
        } catch (error) {
            console.error("Erro ao adicionar tarefa: ", error);
            showNotification('Erro ao adicionar tarefa.', 'danger');
        }
    }
};

/**
 * Exclui uma tarefa do Firestore.
 */
const deleteTask = async (id) => {
    try {
        await deleteDoc(doc(db, "tarefas", id));
        showNotification('Tarefa excluída com sucesso!', 'danger');
    } catch (error) {
        console.error("Erro ao excluir tarefa: ", error);
        showNotification('Erro ao excluir tarefa.', 'danger');
    }
};

/**
 * Atualiza o texto de uma tarefa no Firestore.
 */
const updateTask = async (id, newText) => {
    try {
        await updateDoc(doc(db, "tarefas", id), { text: newText });
        showNotification('Tarefa atualizada com sucesso!', 'info');
    } catch (error) {
        console.error("Erro ao atualizar tarefa: ", error);
        showNotification('Erro ao atualizar tarefa.', 'danger');
    }
};

/**
 * Atualiza a ordem das tarefas no Firestore apos o drag-and-drop.
 */
const updateTasksOrder = async () => {
    const batch = writeBatch(db);
    const taskItems = taskList.querySelectorAll('li');
    
    taskItems.forEach((task, index) => {
        const taskId = task.getAttribute('data-id');
        const taskRef = doc(db, "tarefas", taskId);
        batch.update(taskRef, { order: index });
    });

    try {
        await batch.commit();
        showNotification('Ordem das tarefas atualizada!', 'info');
    } catch (error) {
        console.error("Erro ao atualizar a ordem: ", error);
        showNotification('Erro ao salvar a nova ordem.', 'danger');
    }
};

/**
 * Inicializa a biblioteca SortableJS para drag-and-drop.
 */
const initializeSortable = () => {
    new Sortable(taskList, {
        handle: '.drag-handle', // Define o elemento que inicia o arraste
        animation: 150,
        chosenClass: "dragging",
        onEnd: updateTasksOrder
    });
};

/**
 * Renderiza a lista de tarefas na tela.
 */
const renderTasks = (tasks) => {
    const focusedElement = document.activeElement;
    const focusedTaskId = focusedElement.closest('li')?.getAttribute('data-id');

    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.setAttribute('data-id', task.id);

        // Cria o ícone de "alça" para arrastar
        const dragHandle = document.createElement('div');
        dragHandle.className = 'drag-handle';
        dragHandle.innerHTML = '<i class="fa-solid fa-grip-vertical"></i>';

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

        // Adiciona os elementos na ordem correta
        li.appendChild(dragHandle);
        li.appendChild(span);
        li.appendChild(editInput);
        li.appendChild(buttonsDiv);
        taskList.appendChild(li);
    });

    if (focusedTaskId) {
        const focusedLi = taskList.querySelector(`li[data-id="${focusedTaskId}"] .edit-input`);
        focusedLi?.focus();
    }
};

// --- Event Listeners ---
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') addTask();
});

taskList.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    const li = button.closest('li');
    const taskId = li.getAttribute('data-id');
    const span = li.querySelector('span');
    const input = li.querySelector('.edit-input');
    const editBtn = li.querySelector('.edit-btn');
    const saveBtn = li.querySelector('.save-btn');

    if (button.classList.contains('delete-btn')) {
        deleteTask(taskId);
    } else if (button.classList.contains('edit-btn')) {
        span.classList.add('hidden');
        input.classList.remove('hidden');
        editBtn.classList.add('hidden');
        saveBtn.classList.remove('hidden');
        input.focus();
    } else if (button.classList.contains('save-btn')) {
        const newText = input.value.trim();
        if (newText && newText !== span.textContent) {
            updateTask(taskId, newText);
        } else {
            span.classList.remove('hidden');
            input.classList.add('hidden');
            editBtn.classList.remove('hidden');
            saveBtn.classList.add('hidden');
        }
    }
});

const q = query(tasksCollection, orderBy("order"));
onSnapshot(q, (snapshot) => {
    const tasks = [];
    snapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() });
    });
    renderTasks(tasks);
});

initializeSortable();
