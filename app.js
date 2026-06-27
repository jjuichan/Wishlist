document.addEventListener('DOMContentLoaded', () => {
    let items = JSON.parse(localStorage.getItem('wishlistItems')) || [];
    let currentFilter = { store: null };

    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('menuBtn');
    const closeBtn = document.getElementById('closeBtn');
    
    menuBtn.addEventListener('click', () => sidebar.classList.add('open'));
    closeBtn.addEventListener('click', () => sidebar.classList.remove('open'));

    // 🚀 사진 용량을 획기적으로 줄여주는 압축 함수 (새로 추가됨)
    function compressImage(file, maxWidth = 800) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // 가로가 800px을 넘으면 비율에 맞춰서 축소
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // 용량이 작은 JPEG 포맷(화질 70%)으로 변환하여 반환
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
            };
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
        const saveBtn = document.getElementById('saveBtn');

        // 사진이 첨부되었을 때 압축 진행
        if (fileInput.files.length > 0) {
            const originalText = saveBtn.innerText;
            saveBtn.innerText = '사진 압축 중...⏳'; // 버튼 글자 변경
            saveBtn.disabled = true;

            try {
                imageBase64 = await compressImage(fileInput.files[0]);
            } catch(e) {
                alert('사진 처리 중 오류가 발생했습니다.');
            }

            saveBtn.innerText = originalText;
            saveBtn.disabled = false;
        }

        const newItem = { id: Date.now(), store, name, price, desc, image: imageBase64 };
        items.push(newItem);
        
        try {
            localStorage.setItem('wishlistItems', JSON.stringify(items));
            renderSidebar();
            renderItems();
            document.querySelectorAll('.add-form input, .add-form textarea').forEach(el => el.value = '');
        } catch (e) {
            items.pop(); // 용량 부족 시 방금 넣은 아이템 다시 빼기
            alert('⚠️ 저장 공간이 꽉 찼습니다! 기존 아이템을 지우고 다시 시도해 주세요.');
        }
    });

    window.deleteItem = function(id) {
        items = items.filter(item => item.id !== id);
        try {
            localStorage.setItem('wishlistItems', JSON.stringify(items));
        } catch(e) {}
        renderSidebar();
        renderItems();
    }

    window.filterItems = function(store) {
        currentFilter = { store };
        sidebar.classList.remove('open');
        renderItems();
    }

    function renderSidebar() {
        const treeView = document.getElementById('treeView');
        treeView.innerHTML = `<div class="store-group" onclick="filterItems(null)">전체 보기</div>`;
        
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
