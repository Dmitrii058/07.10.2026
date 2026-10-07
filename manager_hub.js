let contractorsDatabase = {
    "ivan": {
        name: "Иван Иванович",
        phone: "+7 (999) 111-22-33",
        balance: 45200,
        tickets: [
            { id: 101, text: "Срочно нужны передние тормозные колодки Brembo на Фокус 3. Есть на складе?", city: "Москва" },
            { id: 102, text: "Оформил возврат по браку свечей, когда будет подтверждение?", city: "Москва" }
        ],
        orders: [
            { id: "AM-785112", title: "Фильтр масляный MANN-FILTER", article: "W 610/3", price: 850, status: "Создан" },
            { id: "AM-785113", title: "Колодки передние Brembo", article: "P 85 020", price: 2000, status: "К отгрузке" }
        ]
    },
    "petr": {
        name: "Петр Петрович",
        phone: "+7 (910) 777-88-99",
        balance: 14000,
        tickets: [
            { id: 103, text: "Заказ со склада Санкт-Петербурга задерживается на два дня, уточните статус.", city: "Санкт-Петербург" }
        ],
        orders: [
            { id: "AM-764301", title: "Амортизатор передний KYB Excel-G", article: "334812", price: 5800, status: "Создан" }
        ]
    }
};

let currentSelectedKey = "none";

document.addEventListener('DOMContentLoaded', () => {
    // ГЛАВНОЕ ИСПРАВЛЕНИЕ ВЫЛЕТОВ: Насильно ставим роль client для обхода блокировок на страницах каталогов
    localStorage.setItem('am_user_role', 'client');

    // Синхронизация городов
    const citySelector = document.getElementById('city-selector');
    if (citySelector) {
        const savedCity = localStorage.getItem('selectedCity') || 'Москва';
        citySelector.value = savedCity;
        citySelector.addEventListener('change', (e) => {
            localStorage.setItem('selectedCity', e.target.value);
        });
    }

    syncMemoryToDatabase();
});

function syncMemoryToDatabase() {
    if (localStorage.getItem('am_user_name')) {
        contractorsDatabase["ivan"].name = localStorage.getItem('am_user_name');
        contractorsDatabase["ivan"].balance = parseInt(localStorage.getItem('am_user_balance') || '45200');
        if (localStorage.getItem('am_user_phone')) {
            contractorsDatabase["ivan"].phone = localStorage.getItem('am_user_phone');
        }
    }
}

function onSelectContractor() {
    const selector = document.getElementById('global-client-selector');
    currentSelectedKey = selector.value;

    if (currentSelectedKey === 'none') return;

    const data = contractorsDatabase[currentSelectedKey];

    document.getElementById('cfg-client-name').value = data.name;
    document.getElementById('cfg-client-phone').value = data.phone;
    document.getElementById('cfg-client-balance').value = data.balance;

    renderClientTickets(data.tickets);
    renderClientOrders(data.orders);

    document.getElementById('manager-workspace').style.display = 'block';
}

function renderClientTickets(tickets) {
    const listWrapper = document.getElementById('tickets-list-wrapper');
    const emptyState = document.getElementById('tickets-empty-state');

    if (!listWrapper) return;
    listWrapper.innerHTML = '';

    if (!tickets || tickets.length === 0) {
        emptyState.style.display = 'block';
        listWrapper.style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';
    listWrapper.style.display = 'flex';
    listWrapper.style.flexDirection = 'column';
    listWrapper.style.gap = '12px';

    tickets.forEach(t => {
        const div = document.createElement('div');
        div.className = 'ticket-inline-card';
        div.style.background = '#f8fafc';
        div.style.border = '1px solid #e2e8f0';
        div.style.padding = '12px';
        div.style.borderRadius = '8px';
        div.style.borderLeft = '4px solid #ea580c';
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; font-size:12px; color:#64748b; margin-bottom:4px;">
                <span>📍 Филиал: <strong>${t.city}</strong></span>
                <span style="color:#ea580c; font-weight:bold;">● В обработке</span>
            </div>
            <p style="font-size:14px; color:#0f172a; line-height:1.4; margin: 0;">${t.text}</p>
        `;
        listWrapper.appendChild(div);
    });
}

function renderClientOrders(orders) {
    const tbody = document.getElementById('manager-orders-rows-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!orders || orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="padding:20px; text-align:center; color:#94a3b8; font-weight:600;">У данного клиента нет активных заказов.</td></tr>`;
        return;
    }

    orders.forEach((order, index) => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = "1px solid #e2e8f0";
        
        let statusBadge = '';
        let actionButton = '';

        if (order.status === "Создан") {
            statusBadge = `<span class="badge-status-created">Создан</span>`;
            actionButton = `<button class="btn-next-step" onclick="changeStatusStep('${index}', 'К отгрузке')">В отгрузку →</button>`;
        } else if (order.status === "К отгрузке") {
            statusBadge = `<span class="badge-status-shipping">К отгрузке</span>`;
            actionButton = `<button class="btn-next-step" style="background:#0c56ea;" onclick="changeStatusStep('${index}', 'Выдать')">Перевести в "Выдать" →</button>`;
        } else if (order.status === "Выдать") {
            statusBadge = `<span class="badge-status-ready">Готов к выдаче</span>`;
            actionButton = `<button class="btn-next-success" onclick="transferToSalesArchive('${index}')">📦 Выдать товар</button>`;
        }

        tr.innerHTML = `
            <td style="padding: 12px;"><strong style="color:#ea580c;">${order.id}</strong></td>
            <td style="padding: 12px; font-weight:600; color:#0f172a;">${order.title}</td>
            <td style="padding: 12px; font-family:monospace; font-weight:bold; color:#475569;">${order.article}</td>
            <td style="padding: 12px; font-weight:700; color:#0f172a;">${order.price.toLocaleString()} ₽</td>
            <td style="padding: 12px;">${statusBadge}</td>
            <td style="padding: 12px; text-align:center;">${actionButton}</td>
        `;
        tbody.appendChild(tr);
    });
}

function changeStatusStep(index, nextStatus) {
    const data = contractorsDatabase[currentSelectedKey];
    if (data && data.orders[index]) {
        data.orders[index].status = nextStatus;
        renderClientOrders(data.orders);
        showNoticeAlert(`Статус товара успешно обновлен до: "${nextStatus}"`);
    }
}

function transferToSalesArchive(index) {
    const data = contractorsDatabase[currentSelectedKey];
    if (data && data.orders[index]) {
        const completedOrder = data.orders[index];
        let globalSales = JSON.parse(localStorage.getItem('am_sales_archive')) || [];
        
        const newSaleRecord = {
            date: new Date().toLocaleDateString('ru-RU'),
            client: data.name,
            title: completedOrder.title,
            article: completedOrder.article,
            qty: "1 шт.",
            price: `${completedOrder.price.toLocaleString()} ₽`
        };

        globalSales.unshift(newSaleRecord);
        localStorage.setItem('am_sales_archive', JSON.stringify(globalSales));

        data.orders.splice(index, 1);
        renderClientOrders(data.orders);
        showNoticeAlert(`🎉 Заказ успешно ВЫДАН! Сделка перенесена в раздел «Продажи (Архив сделок)»!`);
    }
}

function saveClientCard(event) {
    event.preventDefault();

    const nameVal = document.getElementById('cfg-client-name').value.trim();
    const phoneVal = document.getElementById('cfg-client-phone').value.trim();
    const balanceVal = document.getElementById('cfg-client-balance').value.trim();

    contractorsDatabase[currentSelectedKey].name = nameVal;
    contractorsDatabase[currentSelectedKey].phone = phoneVal;
    contractorsDatabase[currentSelectedKey].balance = parseInt(balanceVal);

    if (currentSelectedKey === 'ivan') {
        localStorage.setItem('am_user_name', nameVal);
        localStorage.setItem('am_user_balance', balanceVal);
        localStorage.setItem('am_user_phone', phoneVal);
    }

    showNoticeAlert(`💾 Карточка контрагента успешно сохранена и синхронизирована с платформой.`);
}

function showNoticeAlert(text) {
    const alertBox = document.getElementById('sandbox-alert');
    const textBox = document.getElementById('sandbox-alert-text');
    if (alertBox && textBox) {
        textBox.innerText = text;
        alertBox.style.display = 'flex';
    }
}

function handleLogout(e) {
    e.preventDefault();
    localStorage.clear();
    alert('Сессия администратора завершена.');
    window.location.href = 'index.html';
}