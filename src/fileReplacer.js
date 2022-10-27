export const replacer = (files) => async (page, files = {}) => {
    await page.evaluate(async (content) => {
        const {headerContent, footerContent, announcementContent, replyContent} = content;

        const header = document.querySelector('#html-header');
        if (header) {
            header.innerHTML = headerContent;
        } else {
            document.querySelector('#mybb-counter').insertAdjacentHTML('afterend', `<div id="html-header">${headerContent}</div>`);
        }

        const footer = document.querySelector('#html-footer');
        if (footer) {
            footer.innerHTML = footerContent;
        } else {
            document.querySelector('.punbb').insertAdjacentHTML('beforeend', `<div id="html-footer">${footerContent}</div>`);
        }

        //TODO - будет рисоваться на всех страницах, подумать, как сделать только на главной
        const announcement = document.querySelector('#pun-announcement');
        const announcementDefault = 
        `<div id="pun-announcement" class="section">
            <h2><span>Объявление</span></h2>
            <div class="container">
                <div class="html-box">
                    ${announcementContent}
                </div>
            </div>
        </div>`;
        if (announcement) {
            announcement.innerHTML = announcementDefault
        } else {
            document.querySelector('#pun-ulinks').insertAdjacentHTML('afterend', announcementDefault);
        }
        
        const reply = document.querySelector('.fs-box.hashelp');
        if (reply) {
            reply.insertAdjacentHTML('beforeend', replyContent);
        }
    }, files)
};