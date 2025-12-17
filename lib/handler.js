const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const config = require('../config.js');

const handleResponse = require('../jeeydev.js');

const date = new Date();
const pad = n => (n < 10 ? '0' + n : n);

const currentTime = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} WIB, ${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;

module.exports = async (socket, messages, memoryStore) => {
  const client = sock = socket;
  const msg = messages;
  const mstore = memoryStore;

  const jid = msg.chat ? msg.chat : msg.key.remoteJid;
  const botNumber = socket.user.id.split(':')[0];
  const botName = config.bot_name;
  const ownerNumber = config.owner_number;
  const ownerName = config.owner_name;
  const senderNumber = msg.sender.replace(/\D/g, '');
  let senderName = msg.pushName || 'Unknown';

  if (senderNumber === botNumber) {
    senderName = 'Me';
  }

  const body = msg.mtype === 'conversation' ? msg.message.conversation : msg.mtype === 'extendedTextMessage' ? msg.message.extendedTextMessage.text : msg.mtype === 'imageMessage' ? msg.message.imageMessage.caption : msg.mtype === 'videoMessage' ? msg.message.videoMessage.caption : '';
  const budy = typeof msg.text === 'string' ? msg.text : '';

  const prefixes = Array.isArray(config.prefix) ? config.prefix : [config.prefix].filter(Boolean);
  const isPrefixed = prefixes.some(p => body.startsWith(p));
  const usedPrefix = isPrefixed ? prefixes.find(p => body.startsWith(p)) : '';

  const command = isPrefixed ?
    body.slice(usedPrefix.length).trim().split(/ +/).shift().toLowerCase() :
    body.trim().split(/ +/).shift().toLowerCase();
  const query = isPrefixed ?
    body.slice(usedPrefix.length).trim().split(/ +/).slice(1).join(' ') :
    body.trim().split(/ +/).slice(1).join(' ');

  const parameters = (separator) => query.split(separator).map(parameter => parameter.trim());
  const isQuoted = msg.quoted ? msg.quoted : msg;
  const isQuotedMsg = (isQuoted.msg || isQuoted);
  const isQuotedMimeType = (isQuoted.msg || isQuoted).mimetype || '';
  const isQuotedText = msg.type === 'extendexTextMessage' && JSON.stringify(msg).includes('textMessage');
  const isQuotedImage = msg.type === 'extendedTextMessage' && JSON.stringify(msg).includes('imageMessage');
  const isQuotedLocation = msg.type === 'extendedTextMessage' && JSON.stringify(msg).includes('locationMessage');
  const isQuotedVideo = msg.type === 'extendedTextMessage' && JSON.stringify(msg).includes('videoMessage');
  const isQuotedSticker = msg.type === 'extendedTextMessage' && JSON.stringify(msg).includes('stickerMessage');
  const isQuotedAudio = msg.type === 'extendedTextMessage' && JSON.stringify(msg).includes('audioMessage');
  const isQuotedContact = msg.type === 'extendedTextMessage' && JSON.stringify(msg).includes('contactMessage');
  const isQuotedDocument = msg.type === 'extendedTextMessage' && JSON.stringify(msg).includes('documentMessage');
  const isMedia = /image|video|sticker|audio/.test(isQuotedMimeType);
  const isImage = (msg.type == 'imageMessage');
  const isVideo = (msg.type == 'videoMessage');
  const isAudio = (msg.type == 'audioMessage');
  const isText = (msg.type == 'textMessage');
  const isSticker = (msg.type == 'stickerMessage');

  const isMe = botNumber === senderNumber;
  const isOwner = ownerNumber === senderNumber;

  const isGroup = msg.isGroup;

  let groupMetadata;
  let groupName;
  let groupId;
  let groupAdmin;

  if (isGroup) {
    groupMetadata = await client.groupMetadata(jid);
    groupName = groupMetadata.subject;
    groupId = groupMetadata.id;
    groupAdmin = groupMetadata.participants.find(participant => participant.id === msg.sender && participant.admin !== null);
  }

  if (config.chat_mode === 'private') {
    if (msg) {
      if (isGroup) {
        if (body.startsWith(config.prefix)) {
          msg.reply('Bot hanya dapat digunakan di private chat');
          return;
        }
      }
    }
  } else if (config.chat_mode === 'group') {
    if (msg) {
      if (!isGroup) {
        if (body.startsWith(config.prefix)) {
          msg.reply('Bot hanya dapat digunakan di group chat');
          return;
        }
      }
    }
  } else if (config.chat_mode === 'self') {
    if (!msg.key.fromMe && !isOwner) {
      return;
    }
  }

  if (config.bot_offline_status) {
    client.sendPresenceUpdate('unavailable', jid);
  } else {
    client.sendPresenceUpdate('available', jid);
  }

  if (config.automatic_update_profile_status[0]) {
    client.updateProfileStatus(config.automatic_update_profile_status[1]);
  }

  if (msg.message) {
    if (body.startsWith(config.prefix)) {
      if (config.automatic_read_messages) {
        client.readMessages([msg.key]);
      }

      if (config.automatic_typing_or_recording[0]) {
        if (config.automatic_typing_or_recording[1] === 'typing') {
          client.sendPresenceUpdate('composing', jid);
        } else if (config.automatic_typing_or_recording[1] === 'recording') {
          client.sendPresenceUpdate('recording', jid);
        } else {
          client.sendPresenceUpdate('paused', jid);
        }
      }
    }

    if (config.only_show_command_chat) {
      if (msg.message && body.startsWith(config.prefix)) {
        console.log('\n• ' + chalk.bold(chalk.greenBright('New Message:')) + '\n- ' + chalk.cyanBright('From:'), chalk.whiteBright(senderName), chalk.yellowBright('- ' + senderNumber) + '\n- ' + chalk.cyanBright('In:'), chalk.whiteBright(!isGroup ? 'Private Chat' : 'Group Chat - ' + chalk.yellowBright(groupName)) + '\n- ' + chalk.cyanBright('Time: ') + chalk.whiteBright(currentTime) + '\n- ' + chalk.cyanBright('Message: ') + chalk.whiteBright(body || msg.mtype));
      }
    } else {
      console.log('\n• ' + chalk.bold(chalk.greenBright('New Message:')) + '\n- ' + chalk.cyanBright('From:'), chalk.whiteBright(senderName), chalk.yellowBright('- ' + senderNumber) + '\n- ' + chalk.cyanBright('In:'), chalk.whiteBright(!isGroup ? 'Private Chat' : 'Group Chat - ' + chalk.yellowBright(groupName)) + '\n- ' + chalk.cyanBright('Time: ') + chalk.whiteBright(currentTime) + '\n- ' + chalk.cyanBright('Message: ') + chalk.whiteBright(body || msg.mtype));
    }
  }

  const tmpFilePathOrders = path.join(__dirname, '..', 'tmp', 'orders.json');

  setInterval(() => {
    if (fs.existsSync(tmpFilePathOrders)) {
      const orderData = JSON.parse(fs.readFileSync(tmpFilePathOrders, 'utf8'));

      Object.keys(orderData).forEach(key => {
        const createdAt = new Date(orderData[key].createdAt).getTime();
        const currentTime = Date.now();

        if (currentTime - createdAt > 300000) {
          const payId = orderData[key].payId;

          delete orderData[key];
          fs.writeFileSync(tmpFilePathOrders, JSON.stringify(orderData, null, 2));
        }
      });

      fs.writeFileSync(tmpFilePathOrders, JSON.stringify(orderData, null, 2));
    }
  }, 5000);

  const PRODUCTS_DATA_PATH = path.join(__dirname, '..', 'tmp', 'products_data.json');

  function transformCategories(data) {
    if (!data || !data.data) return data;

    return {
      ...data,
      data: data.data.map(item => {
        if (item.category && item.category.toLowerCase() === 'pln') {
          return {
            ...item,
            category: 'Voucher'
          };
        }
        return item;
      })
    };
  }

  function saveProductsData(data) {
    try {
      const transformedData = transformCategories(data);
      fs.writeFileSync(PRODUCTS_DATA_PATH, JSON.stringify(transformedData, null, 2));
      console.log('Data produk berhasil disimpan ke file dengan transformasi category');
    } catch (error) {
      console.error('Error menyimpan data produk:', error);
    }
  }

  function loadProductsData() {
    try {
      if (fs.existsSync(PRODUCTS_DATA_PATH)) {
        const data = fs.readFileSync(PRODUCTS_DATA_PATH, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error membaca data produk:', error);
    }
    return null;
  }

  async function fetchProductsData() {
    try {
      const response = await fetch(config.api.base_url + '/layanan/price_list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          type: 'prabayar',
          api_key: config.api.secret_key
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching data dari API:', error);
      return null;
    }
  }

  let cachedProductsData = null;
  let lastFetchTime = 0;

  async function getProductsData() {
    const now = Date.now();
    const sixHours = 6 * 60 * 60 * 1000;

    if (cachedProductsData && (now - lastFetchTime) < sixHours) {
      console.log('Menggunakan data produk dari cache');
      return cachedProductsData;
    }

    const fileData = loadProductsData();
    if (fileData && (now - lastFetchTime) < sixHours) {
      console.log('Menggunakan data produk dari file');
      cachedProductsData = fileData;
      return fileData;
    }

    console.log('Fetching data produk baru dari API');
    const newData = await fetchProductsData();

    if (newData && newData.data) {
      const transformedData = transformCategories(newData);

      cachedProductsData = transformedData;
      lastFetchTime = now;

      saveProductsData(newData);

      return transformedData;
    }

    if (fileData) {
      console.log('Menggunakan data produk dari file (backup)');
      return fileData;
    }

    return null;
  }

  const tmpFilePathProducts = path.join(__dirname, '..', 'tmp', 'products.json');
  const tmpFilePathStocks = path.join(__dirname, '..', 'tmp', 'stocks.json');

  function readJson(filePath) {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, filePath.includes('products') || filePath.includes('stocks') ? '[]' : '{}');
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data || (filePath.includes('products') || filePath.includes('stocks') ? '[]' : '{}'));
  }

  function writeJson(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  function addProduct(name, code, price, note) {
    let products = readJson(tmpFilePathProducts);

    if (!Array.isArray(products)) products = [];

    const exists = products.find(p => p.code === code);
    if (exists) {
      return msg.reply(`Produk dengan kode "${code}" sudah ada.`);
    }

    const newProduct = {
      price: Number(price),
      code,
      name,
      note,
      available: 0,
      sold: 0
    };

    products.push(newProduct);
    writeJson(tmpFilePathProducts, products);
    msg.reply(`Produk "${name}" berhasil ditambahkan dengan kode "${code}".`);
  }

  function addStockProduct(productCode, username, password, email, note) {
    let products = readJson(tmpFilePathProducts);
    if (!Array.isArray(products)) products = [];

    const productIndex = products.findIndex(p => p.code === productCode);
    if (productIndex === -1) {
      return msg.reply(`Produk dengan kode "${productCode}" tidak ditemukan.`);
    }

    let stocks = readJson(tmpFilePathStocks);
    if (!Array.isArray(stocks)) stocks = [];

    let stockEntry = stocks.find(s => s[productCode]);

    if (!stockEntry) {
      stockEntry = {
        [productCode]: []
      };
      stocks.push(stockEntry);
    }

    stockEntry[productCode].push({
      username,
      password,
      email,
      note
    });

    products[productIndex].available += 1;

    writeJson(tmpFilePathStocks, stocks);
    writeJson(tmpFilePathProducts, products);

    msg.reply(`Stok untuk produk "${productCode}" berhasil ditambahkan.`);
  }

  const tmpFilePathLists = path.join(__dirname, '..', 'tmp', 'lists.json');

  function readData() {
    if (!fs.existsSync(tmpFilePathLists)) {
      fs.writeFileSync(tmpFilePathLists, JSON.stringify({}));
    }
    const data = fs.readFileSync(tmpFilePathLists, 'utf8');
    return JSON.parse(data);
  }

  function writeData(data) {
    fs.writeFileSync(tmpFilePathLists, JSON.stringify(data, null, 2));
  }

  function addList(title, deskripsi) {
    const data = readData();
    if (data[title]) {
      msg.reply(`Cmd "${title}" sudah ada.`);
      return;
    }
    data[title] = deskripsi;
    writeData(data);
    msg.reply(`Berhasil menambahkan "${title}".`);
  }

  function updateList(title, deskripsi) {
    const data = readData();
    if (!data[title]) {
      msg.reply(`Cmd "${title}" tidak ditemukan.`);
      return;
    }
    data[title] = deskripsi;
    writeData(data);
    msg.reply(`Berhasil mengupdate "${title}".`);
  }

  function removeList(title) {
    const data = readData();
    if (!data[title]) {
      msg.reply(`Cmd "${title}" tidak ditemukan.`);
      return;
    }
    delete data[title];
    writeData(data);
    msg.reply(`Berhasil menghapus "${title}".`);
  }

  function showAllCmds() {
    const data = readData();
    return Object.keys(data);
  }

  function getAllLists() {
    const data = readData();
    return Object.entries(data);
  }

  const lists = getAllLists();

  for (const [cmd, text] of lists) {
    if (budy === `${usedPrefix}${cmd}`) {
      return msg.reply(text);
    }
  }

  /*if (!body.startsWith(config.prefix) || body === config.prefix) {
    return;
  }*/

  if (!isPrefixed || prefixes.some(p => body === p)) {
    return;
  }

  try {
    await handleResponse(command, client, msg, {
      body,
      budy,
      config,
      parameters,
      isOwner,
      isMe,
      isGroup,
      groupMetadata,
      jid,
      botNumber,
      botName,
      senderNumber,
      senderName,
      ownerName,
      ownerNumber,
      usedPrefix,
      saveProductsData,
      loadProductsData,
      fetchProductsData,
      getProductsData,
      tmpFilePathProducts,
      tmpFilePathStocks,
      readJson,
      writeJson,
      addProduct,
      addStockProduct,
      tmpFilePathLists,
      readData,
      writeData,
      addList,
      updateList,
      removeList,
      showAllCmds,
      getAllLists,
      tmpFilePathOrders,
      PRODUCTS_DATA_PATH
    });
  } catch (error) {
    console.error(error);
  }
};