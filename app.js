document.addEventListener('DOMContentLoaded', () => {
    let items = JSON.parse(localStorage.getItem('wishlistItems')) || [];
    let currentFilter = { store: null };

    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('menuBtn');
    const closeBtn = document.getElementById('closeBtn');
    
    menuBtn.addEventListener('click', () => sidebar.classList.add('open'));
    closeBtn.addEventListener('click', () => sidebar.classList.remove('open'));

    function getBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    document.getElementById('saveBtn').addEventListener('click', async () => {
        const store = document.getElementById('inputStore').value.trim();
        const name = document.getElementById('inputName').value.trim();
        const price = document.getElementById('inputPrice').value.trim();
        const desc = document.getElementById('inputDesc').value.trim();
        const fileInput = document.getElementById('inputImage');
        
        if (!store || !name) {
            alert('매장과 품목 이름은 필수입니다!');
            return;
        }

        let imageBase64 = "";
        if (fileInput.files.length > 0) {
            imageBase64 = await getBase64(fileInput.files[0]);
        }

        const newItem = { id: Date.now(), store, name, price, desc, image: imageBase64 };
        items.push(newItem);
        saveData();
        
        document.querySelectorAll('.add-form input, .add-form textarea').forEach(el => el.value = '');
    });

    function saveData() {
        localStorage.setItem('wishlistItems', JSON.stringify(items));
        renderSidebar();
        renderItems();
    }

    window.deleteItem = function(id) {
        items = items.filter(item => item.id !== id);
        saveData();
    }

    window.filterItems = function(store) {
        currentFilter = { store };
        sidebar.classList.remove('open');
        renderItems();
    }

    function renderSidebar() {
        const treeView = document.getElementById('treeView');
        treeView.innerHTML = `<div class="store-group" onclick="filterItems(null)">전체 보기</div>`;
        
        // 매장 이름만 중복 없이 추출
        const stores = [...new Set(items.map(item => item.store))];

        stores.forEach(store => {
            treeView.innerHTML += `<div class="store-group" onclick="filterItems('${store}')">📍 ${store}</div>`;
        });
    }

    function renderItems() {
        const container = document.getElementById('itemsContainer');
        const title = document.getElementById('currentViewTitle');
        container.innerHTML = '';

        if (!currentFilter.store) title.innerText = "전체 보기";
        else title.innerText = currentFilter.store;

        const filtered = items.filter(item => {
            if (!currentFilter.store) return true;
            return item.store === currentFilter.store;
        });

        filtered.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-header">
                    <span class="badge">${item.store}</span>
                    <button class="delete-btn" onclick="deleteItem(${item.id})">삭제</button>
                </div>
                ${item.image ? `<img src="${item.image}" style="display:block;">` : ''}
                <div class="card-title">${item.name}</div>
                <div class="card-price">💰 ${item.price || '가격 미정'}</div>
                <div class="card-desc">${item.desc}</div>
            `;
            container.appendChild(card);
        });
    }

    renderSidebar();
    renderItems();
});
