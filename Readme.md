# Mybb styler

Использование:  

__Просмотр своими глазами-руками__  
1) Ставим node и нпм
2) Меняем урл в .env на свой, разрешение в LOOK_RESOLUTION на свое
3) Делаем npm i
4) Делаем npm run create_resources (скопирует структуру ресурсов из папки example в папку resources, которая выпилена из индекса)
5) Делаем npm start
6) Наслаждаемся  

обновления подтягиваются при обновлении страницы, без вечного лазанья в админку и любви с мозгом. плюсом - ваша любимая IDE,
с вашим любимым стилем, цветными скобочками, отображением цветов и всеми вот этими вот плюшками  

__Скриншоты для разных разрешений экрана__  
1) Повторяем пункты 1-4 из прошлого варианта
2) Прописываем нужные разрешения в .env по образцу (из коробки там 1920x1080, 1024x768 и 800х600)
3) ПОКА мы умеем работать только с полем unathorised в linksToScreen.json, но затравки под скармливание нужных юзеров там уже есть(=
4) В массив пишем хвосты ссылок, которые хотим поскринить
5) Делаем npm run make_screenshots
6) Смотрим в папку scrennshots
7) Наслаждаемся

__Возможности__  
1) Подменять загружаемые скрипты(см scriptsMap.json, в to указывать путь относительно папки resources)
2) Подменять стили форума
3) Подменять содержимое форм html-верх, низ, формы ответа и объявления

__Что будет дальше?__  
В планах определиться окончательно с тем, что будет жить в ресурсах, и закинуть их в гитигнор с оставлением минимально рабочего "образца" (можжно вообще их нагенерить/копировать по отдельной команде в целом), научить этого монстра логиниться, скринить страницу редиректа, страницы по улинкам, профили при разных уровнях доступа, создание темы и опроса