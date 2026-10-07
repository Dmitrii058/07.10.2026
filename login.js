document.addEventListener('DOMContentLoaded', function() {
    // Автоматический сброс сессии при переходе на экран авторизации
    localStorage.setItem('am_user_role', 'guest');

    // Синхронизация городов
    const citySelector = document.getElementById('header-city-select');
    if (citySelector) {
        const savedCity = localStorage.getItem('selectedCity');
        if (savedCity) {
            citySelector.value = savedCity;
        }
        citySelector.addEventListener('change', (event) => {
            localStorage.setItem('selectedCity', event.target.value);
        });
    }

    // 1. УПРАВЛЕНИЕ РАБОТОЙ ИНТЕРАКТИВНОГО ГЛАЗКА ПАРОЛЯ
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const eyeIcon = document.getElementById('eye-icon');

    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', function() {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                eyeIcon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.45 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
            } else {
                passwordInput.type === 'password';
                eyeIcon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
            }
        });
    }

    // 2. АВТОРИЗАЦИЯ ФОРМЫ С РАЗДЕЛЕНИЕМ НА КЛИЕНТА И МЕНЕДЖЕРА
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Защита от перезагрузки страницы

            const loginValue = usernameInput.value.trim();
            const passwordValue = passwordInput.value.trim();

            // ПРОВЕРКА 1: Вход для Менеджера (manager@mail.ru / admin)
            if (loginValue === 'manager@mail.ru' && passwordValue === 'admin') {
                localStorage.setItem('am_user_role', 'manager');
                localStorage.setItem('am_user_name', 'Менеджер платформы');
                
                // Перенаправляем в панель менеджера
                window.location.href = 'manager_panel.html';
                
            // ПРОВЕРКА 2: Вход для Клиентов (admin@mail.ru или 123456@mail.ru)
            } else if ((loginValue === 'admin@mail.ru' || loginValue === '123456@mail.ru') && passwordValue === '123456') {
                localStorage.setItem('am_user_role', 'client');
                localStorage.setItem('am_user_name', 'Иван Иванович');
                localStorage.setItem('am_user_balance', '45200');

                window.location.href = 'glavnaya.html';
                
            // Если ни один аккаунт не подошел — показываем окно ошибки
            } else {
                showErrorModal();
            }
        });
    }
});

// Функция вызова модального окна ошибки
function showErrorModal() {
    const modal = document.getElementById('errorModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.setAttribute('data-open', 'true'); // Маркер для отслеживания клавиатуры
    }
}

// Функция закрытия модального окна с очисткой поля пароля
function closeErrorModal() {
    const modal = document.getElementById('errorModal');
    const passwordInput = document.getElementById('password');
    
    if (modal && modal.style.display === 'flex') {
        modal.style.display = 'none';
        modal.removeAttribute('data-open');
        if (passwordInput) {
            passwordInput.value = '';
            passwordInput.focus();
        }
    }
}

// 3. УПРАВЛЕНИЕ ГОРЯЧИМИ КЛАВИШАМИ (ENTER И ESCAPE)
document.addEventListener('keydown', function(event) {
    const modal = document.getElementById('errorModal');
    
    if (modal && modal.hasAttribute('data-open')) {
        if (event.key === 'Escape' || event.key === 'Enter') {
            event.preventDefault(); // Защищаем от случайной повторной отправки формы
            closeErrorModal();
        }
    }
});

// Закрытие модального окна кликом по пустой области вокруг карточки
window.addEventListener('click', function(event) {
    const modal = document.getElementById('errorModal');
    if (event.target === modal) {
        closeErrorModal();
    }
});
