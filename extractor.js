(function(){
    if(!location.href.includes('facebook.com/ads/library')){
        alert('Этот скрипт работает только в Facebook Ad Library');
        return;
    }
    
    const ads = [];
    const seen = new Set();
    
    const decode = s => s ? s.replace(/\\\//g,'/').replace(/\\u([0-9a-fA-F]{4})/g,(_,h)=>String.fromCharCode(parseInt(h,16))) : null;
    
    const html = document.documentElement.innerHTML;
    const re = /"body"\s*:\s*"([^"]*)"\s*,\s*"cta_type"[^}]*?"caption"\s*:\s*"([^"]*)"\s*,\s*"link_description"[^}]*?"link_url"\s*:\s*"([^"]*)"\s*,\s*"title"\s*:\s*"([^"]*)"\s*,\s*"cta_text"[^}]*?"video_hd_url"\s*:\s*"?([^",}]*)"?/g;
    
    let m;
    while((m = re.exec(html)) !== null){
        const [_, body, caption, link_url, title, video] = m;
        if(!video || video === 'null') continue;
        const v = decode(video);
        if(seen.has(v)) continue;
        seen.add(v);
        ads.push({
            domain: decode(caption),
            title: decode(title),
            body: decode(body),
            video: v
        });
    }
    
    if(ads.length === 0){
        alert('Видео не найдены на этой странице');
        return;
    }
    
    // Удаляем старый popup если есть
    const old = document.getElementById('fb-ads-popup');
    if(old) old.remove();
    
    const overlay = document.createElement('div');
    overlay.id = 'fb-ads-popup';
    
    const styles = `
        #fb-ads-popup {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #fb-ads-popup .modal {
            background: #fff;
            border-radius: 12px;
            width: 90%;
            max-width: 1200px;
            max-height: 90%;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        #fb-ads-popup .header {
            padding: 16px 20px;
            background: #1877f2;
            color: #fff;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        #fb-ads-popup .header h2 {
            margin: 0;
            font-size: 18px;
        }
        #fb-ads-popup .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
        }
        #fb-ads-popup .close-btn {
            background: #fff;
            color: #1877f2;
        }
        #fb-ads-popup .copy-btn {
            background: #42b72a;
            color: #fff;
            margin-right: 10px;
        }
        #fb-ads-popup .content {
            overflow-y: auto;
            padding: 0;
        }
        #fb-ads-popup table {
            width: 100%;
            border-collapse: collapse;
        }
        #fb-ads-popup th {
            background: #f0f2f5;
            padding: 12px;
            text-align: left;
            position: sticky;
            top: 0;
            font-size: 13px;
        }
        #fb-ads-popup td {
            padding: 12px;
            border-bottom: 1px solid #e4e6eb;
            font-size: 12px;
            vertical-align: top;
            max-width: 300px;
            word-break: break-word;
        }
        #fb-ads-popup tr:hover {
            background: #f5f6f7;
        }
        #fb-ads-popup a {
            color: #1877f2;
            text-decoration: none;
        }
        #fb-ads-popup a:hover {
            text-decoration: underline;
        }
    `;
    
    const rows = ads.map((a, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${a.domain || '-'}</td>
            <td>${a.title || '-'}</td>
            <td>${a.body || '-'}</td>
            <td><a href="${a.video}" target="_blank">Открыть</a></td>
        </tr>
    `).join('');
    
    overlay.innerHTML = `
        <style>${styles}</style>
        <div class="modal">
            <div class="header">
                <h2>🎬 Найдено ${ads.length} видео</h2>
                <div>
                    <button class="btn copy-btn" id="fb-copy-btn">📋 Копировать JSON</button>
                    <button class="btn close-btn" id="fb-close-btn">✕ Закрыть</button>
                </div>
            </div>
            <div class="content">
                <table>
                    <tr>
                        <th>#</th>
                        <th>Домен</th>
                        <th>Заголовок</th>
                        <th>Описание</th>
                        <th>Видео</th>
                    </tr>
                    ${rows}
                </table>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    document.getElementById('fb-close-btn').addEventListener('click', () => overlay.remove());
    
    document.getElementById('fb-copy-btn').addEventListener('click', function(){
        navigator.clipboard.writeText(JSON.stringify(ads, null, 2));
        this.textContent = '✓ Скопировано!';
    });
    
    overlay.addEventListener('click', e => {
        if(e.target === overlay) overlay.remove();
    });
})();
