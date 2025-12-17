const fs = require('fs');
const path = require('path');
const axios = require('axios');
const QRCode = require('qrcode');

const {
  exec,
  spawn,
  execSync
} = require('child_process');

const {
  generateRandomText,
  toRupiah,
  imageUploader,
  imageToBase64
} = require('./lib/functions.js');

module.exports = async (command, client, msg, options) => {
  const {
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
  } = options;

  const prefix = usedPrefix; //config.prefix[0] || config.prefix || '';

  async function sendMessage(options) {
    return await client.sendMessage(jid, options, {
      quoted: msg
    });
  };

  async function sendMsgTo(jid, options) {
    return await client.sendMessage(jid, options, {
      quoted: msg
    });
  };

  async function deleteMessage(id) {
    return await client.sendMessage(jid, {
      delete: {
        remoteJid: jid,
        fromMe: true,
        id: id
      }
    });
  };

  async function sendTemporaryMessage(options, countdown) {

    await client.sendMessage(jid, options, {
      quoted: msg
    }).then(sentMessage => {

      const msgId = sentMessage.key.id;

      setTimeout(() => {
        deleteMessage(msgId);
      }, countdown);
    });
  };

  async function sendReaction(emoji) {
    const reactionMessage = {
      react: {
        text: emoji,
        key: msg.key,
      },
    };

    return await client.sendMessage(jid, reactionMessage);
  };

  switch (command) {
    case 'self':
    case 'public': {
      if (!(isOwner || isMe)) {
        return msg.reply('❌ Kamu tidak memiliki izin untuk menggunakan fitur ini.');
      }

      client.public = command;

      msg.reply(`Mode ${command.toUpperCase()} telah diaktifkan.`);
      break;
    };

    case 'test': {
      msg.reply('Ok, Success!');
      break;
    }

    case 'total_features':
    case 'total_fitur': {
      const totalFeatures = (fs.readFileSync('./commands.js').toString().match(new RegExp('break', 'g')) || []).length - 1;
      msg.reply(`Jumlah fitur saat ini: ${totalFeatures}`);
      break;
    }

    case 'whoami': {
      if (!(isOwner || isMe)) {
        return msg.reply('Anda adalah pengguna bot.');
      }

      if (isOwner) {
        msg.reply('Anda adalah owner bot.');
      } else if (isMe) {
        msg.reply('Anda adalah bot.');
      } else {
        msg.reply('Anda adalah bot sekaligus owner bot-nya.');
      }

      break;
    }

    /* Start area */
    case 'start': {
      /*const [text] = parameters();

      if (!text) {
        return msg.reply(`Example: ${prefix}${command} Hi`);
      }*/

      try {
        sendReaction(config.reactions.process);

        const options = {
          text: `Hai ${senderName} - @${senderNumber}. Aku adalah ${botName}`,
          mentions: [`${senderNumber}@s.whatsapp.net`],
          //contextInfo: { forwardingScore: 2, isForwarded: true }
        };

        await sendMessage(options).then(async () => {
          sendReaction(config.reactions.success);
        });

      } catch (error) {
        sendReaction(config.reactions.failed);
        msg.reply(`Error: ${error.message}`);
        console.error(error);
      };

      break;
    };
    /* End Start area */

    case 'owner_menu':
    case 'menu_owner': {
      if (!(isOwner || isMe)) return msg.reply('❌ Kamu tidak memiliki izin untuk menggunakan fitur ini.');

      const menu = `*\`Hai ${senderName}\`*

- ${prefix}buy <code,target> (Untuk membeli produk menggunakan saldo dari admin)
- ${prefix}deposit <nominal> (Untuk mengisi saldo admin)
- ${prefix}check_balance (Untuk mengecek jumlah saldo admin)
- ${prefix}wd_balance <nominal> (Untuk tarik saldo admin, minimal penarikan Rp 3.000)
- ${prefix}tarik_saldo_provider <kode_produk> (Untuk tarik saldo admin, minimal penarikan Rp 3.000)

- ${prefix}get_stock
- ${prefix}add_stock
- ${prefix}add_product
- ${prefix}update_product
- ${prefix}delete_product
- ${prefix}delete_all_products
- ${prefix}delete_stock

- ${prefix}add_list
- ${prefix}update_list
- ${prefix}delete_list
- ${prefix}delete_all_lists

- ${prefix}delete_cache
- ${prefix}delete_data
`;

      msg.reply(menu);
      break;
    }

case 'menu':
case 'allmenu': {
  const menu = `*Halo ${senderName}, selamat datang di layanan topup otomatis 24 jam!*

Kami menyediakan berbagai produk digital dan game populer yang bisa kamu beli dengan cepat dan mudah melalui pembayaran *QRIS*.

Berikut adalah daftar layanan yang tersedia:

╭─〔 *GAME TERPOPULER:* 〕
│ ${prefix}ml, ${prefix}ml_wdp, ${prefix}ml_sl, ${prefix}ml_tl - Mobile Legends
│ ${prefix}mc - Magic Chess
│ ${prefix}hok - Honor of Kings
│ ${prefix}aov - Arena of Valor
│ ${prefix}lol - League of Legends
│ ${prefix}ab - Arena Breakout
│ ${prefix}coc - Clash of Clans
│ ${prefix}lm - Lords Mobile
│ ${prefix}ff - Free Fire
│ ${prefix}pubg - PUBG
│ ${prefix}codm - CODM
│ ${prefix}pb - Point Blank
│ ${prefix}gi - Genshin Impact
│ ${prefix}fcm - FC Mobile
╰─────────────
╭─〔 *DATA INTERNET:*
│ ${prefix}byu_data - by.U
│ ${prefix}tsel_data - Telkomsel
│ ${prefix}sf_data - Smartfren
│ ${prefix}xl_data - XL
│ ${prefix}axis_data - Axis
│ ${prefix}im3_data - IM3
│ ${prefix}tri_data - Tri
╰─────────────
╭─〔 *PULSA & SALDO:*
│ ${prefix}byu_pulsa - by.U
│ ${prefix}tsel_pulsa - Telkomsel
│ ${prefix}sf_pulsa - Smartfren
│ ${prefix}xl_pulsa - XL
│ ${prefix}axis_pulsa - Axis
│ ${prefix}im3_pulsa - IM3
│ ${prefix}tri_pulsa - Tri
╰─────────────
│ ${prefix}dana - Dana
│ ${prefix}ovo - Ovo
│ ${prefix}gopay - Gopay
│ ${prefix}spay - Spay
│ ${prefix}apay - Apay
│ ${prefix}linkaja - LinkAja
│ ${prefix}sakuku - Sakuku
│ ${prefix}doku - Doku
╰─────────────
╭─〔 *VOUCHER & AKUN PREMIUM*
│ ${prefix}pln - Pln
│ ${prefix}indomaret - Indomaret
│ ${prefix}alfamart - Alfamart
│ ${prefix}gplay - Gplay
│ ${prefix}unipin - Unipin
│ ${prefix}traveloka - Traveloka
│ ${prefix}itunes - Itunes
│ ${prefix}xbox - Xbox
│ ${prefix}ps - PlayStation
│ ${prefix}vidio_ori - Vidio Original
│ ${prefix}viu_ori - Viu Original
│ ${prefix}spotify_ori - Spotify Original
│ ${prefix}roblox - Roblox
╰─────────────
│ ${prefix}am - Alight Motion
│ ${prefix}capcut - Capcut pro
│ ${prefix}canva - Canva pro
│ ${prefix}remini - Remini 
│ ${prefix}youtube - YouTube
│ ${prefix}vidio - Vidio
│ ${prefix}viu - Viu
│ ${prefix}netflix - Netflix
│ ${prefix}bstation - Bstation
│ ${prefix}dramabox - Dramabox
│ ${prefix}wetv - Wetv
│ ${prefix}disney - Disney
│ ${prefix}spotify - Spotify
╰─────────────
*🛍️ PRODUK LAINNYA*
* ${prefix}stocks

*🔍 PENCARIAN PRODUK:*
Ketik:
- *${prefix}search <nama_produk>* → untuk mencari berdasarkan nama
- *${prefix}srbc <kode>* → untuk mencari berdasarkan kode produk

_Bot ini telah terintegrasi dengan sistem API Payment Gateway._

Terima kasih telah menggunakan layanan kami!
`;

  // Kirim gambar dengan caption menu
  try {
    // Ganti URL ini dengan URL gambar bot kamu
    const imageUrl = 'https://files.catbox.moe/iosevd.png'; // <-- GANTI dengan URL gambar bot kamu
    
    await client.sendMessage(jid, {
      image: { url: imageUrl },
      caption: menu
    }, { quoted: msg });
  } catch (error) {
    // Fallback: jika gagal kirim gambar, kirim text biasa
    console.error('Gagal mengirim gambar menu:', error);
    msg.reply(menu);
  }
  
  break;
}
    
    case 'games': {
    	const menu = `*🎮 GAME TERPOPULER:*
→ Mobile Legends: ${prefix}ml, ${prefix}ml_wdp, ${prefix}ml_sl, ${prefix}ml_tl
* Magic Chess: ${prefix}mc
* Honor of Kings: ${prefix}hok
* Arena of Valor: ${prefix}aov
* League of Legends ${prefix}lol
* Arena Breakout: ${prefix}ab
* Clash of Clans: ${prefix}coc
* Lords Mobile: ${prefix}lm
* Free Fire: ${prefix}ff
* PUBG: ${prefix}pubg
* CODM: ${prefix}codm
* Point Blank: ${prefix}pb
* Genshin Impact: ${prefix}gi
* FC Mobile: ${prefix}fcm
`

msg.reply(menu);
    	break;
    }
    
    case 'premium': {
    	const menu = `*🧾 AKUN PREMIUM*
* Indomaret: ${prefix}indomaret
* Alfamart: ${prefix}alfamart
* Google Play: ${prefix}gplay
* Unipin: ${prefix}unipin
* Traveloka: ${prefix}traveloka
* iTunes: ${prefix}itunes
* Xbox: ${prefix}xbox
* PlayStation: ${prefix}ps
* Vidio Original: ${prefix}vidio_ori
* Viu Original: ${prefix}viu_ori
* Spotify Original: ${prefix}spotify_ori
* Roblox: ${prefix}roblox

* Alight Motion: ${prefix}am
* CapCut: ${prefix}capcut
* Canva: ${prefix}canva
* Remini: ${prefix}remini
* YouTube: ${prefix}youtube
* Vidio: ${prefix}vidio
* Viu: ${prefix}viu
* Netflix: ${prefix}netflix
* Bstation: ${prefix}bstation
* DramaBox: ${prefix}dramabox
* WeTV: ${prefix}wetv
* Disney: ${prefix}disney
* Spotify: ${prefix}spotify

*🛒 PRODUK LAINNYA*
* Stocks: ${prefix}stocks
`;

msg.reply(menu);
    	break;
    }

    case 'search':
    case 'sr':
    case 'srbc': {
      const [query] = parameters();
      if (!query) {
        return msg.reply(`Contoh penggunaan:\n• *${prefix}search <nama_produk>*\n• *${prefix}srbc <kode>*`);
      }

      try {
        const result = await getProductsData();

        if (!result || !result.data) {
          return msg.reply('Tidak dapat mengambil data produk. Silakan coba lagi nanti.');
        }

        let filteredProducts = [];

        if (command === 'search' || command === 'sr') {
          filteredProducts = result.data.filter(item =>
            item.name && item.name.toLowerCase().includes(query.toLowerCase())
          );
        } else if (command === 'srbc') {
          filteredProducts = result.data.filter(item =>
            item.code && item.code === query.toUpperCase()
          );
        }

        if (filteredProducts.length === 0) {
          return msg.reply(`Tidak ditemukan produk dengan ${command === 'search' ? 'nama' : 'kode'} "${query}"`);
        }

        let listText = `*🔍 HASIL PENCARIAN ${command === 'search' ? 'NAMA' : 'KODE'} PRODUK*\n\n` +
          `*✅ : Tersedia*\n` +
          `*⛔ : Tidak Tersedia*\n\n` +
          `Ditemukan ${filteredProducts.length} produk:\n\n`;

        filteredProducts.forEach((item) => {
          const profit = (config.api.profit / 100) * item.price;
          const finalPrice = Number(item.price) + Number(Math.ceil(profit));

          listText += `╭⟬ *${item.status == 'available' ? '✅' : '⛔'} ${item.name}*\n` +
            `┆•  Provider: ${item.provider || 'Tidak diketahui'}\n` +
            `┆•  Category: ${item.category || 'Tidak diketahui'}\n` +
            `┆•  Harga: ${toRupiah(finalPrice)}\n` +
            `┆•  Kode: ${item.code}\n` +
            `┆•  Status: ${item.status || 'unknown'}\n` +
            `┆•  Note: ${item.note || 'Tidak ada'}\n` +
            `╰──────────◇\n\n`;
        });

        listText += `_Ingin melakukan topup? ketik *${prefix}order KODE,TUJUAN*_`;

        msg.reply(listText);
      } catch (error) {
        console.error('Error:', error);
        msg.reply('Terjadi kesalahan saat mencari data produk.');
      }

      break;
    }

    case 'mlbb':
    case 'ml':
    case 'ml_wdp':
    case 'ml_sl':
    case 'ml_tl':
    case 'wdp':
    case 'starlight':
    case 'twilight':
    case 'mcgg':
    case 'mc':
    case 'hok':
    case 'aov':
    case 'lol':
    case 'ab':
    case 'coc':
    case 'lm':
    case 'ff':
    case 'pubg':
    case 'codm':
    case 'pb':
    case 'gi':
    case 'fcm':

    case 'byu_data':
    case 'tsel_data':
    case 'telkomsel_data':
    case 'sf_data':
    case 'smartfren_data':
    case 'xl_data':
    case 'axis_data':
    case 'im3_data':
    case 'isat_data':
    case 'indosat_data':
    case 'tri_data':

    case 'byu_pulsa':
    case 'tsel_pulsa':
    case 'telkomsel_pulsa':
    case 'sf_pulsa':
    case 'smartfren_pulsa':
    case 'xl_pulsa':
    case 'axis_pulsa':
    case 'im3_pulsa':
    case 'isat_pulsa':
    case 'indosat_pulsa':
    case 'tri_pulsa':

    case 'pln':
    case 'dana':
    case 'ovo':
    case 'gopay':
    case 'shopeepay':
    case 'spay':
    case 'astrapay':
    case 'apay':
    case 'linkaja':
    case 'sakuku':
    case 'doku':

    case 'indomaret':
    case 'alfamart':
    case 'gplay':
    case 'unipin':
    case 'traveloka':
    case 'itunes':
    case 'xbox':
    case 'playstation':
    case 'ps':
    case 'vidio_ori':
    case 'viu_ori':
    case 'spotify_ori':
    case 'roblox':

    case 'am':
    case 'capcut':
    case 'canva':
    case 'remini':
    case 'youtube':
    case 'vidio':
    case 'viu':
    case 'netflix':
    case 'disney':
    case 'bstation':
    case 'dramabox':
    case 'wetv':
    case 'spotify': {
      const products = {
        'ml': {
          provider: 'Mobile Legends',
          category: 'Games'
        },
        'mlbb': {
          provider: 'Mobile Legends',
          category: 'Games'
        },
        'ml_wdp': {
          provider: 'Mobile Legends',
          category: 'Games',
          codePrefix: 'MLW'
        },
        'ml_sl': {
          provider: 'Mobile Legends',
          category: 'Games',
          codePrefix: 'MLS'
        },
        'ml_tl': {
          provider: 'Mobile Legends',
          category: 'Games',
          codePrefix: 'MLT'
        },
        'wdp': {
          provider: 'Mobile Legends',
          category: 'Games',
          codePrefix: 'MLW'
        },
        'starlight': {
          provider: 'Mobile Legends',
          category: 'Games',
          codePrefix: 'MLS'
        },
        'twilight': {
          provider: 'Mobile Legends',
          category: 'Games',
          codePrefix: 'MLT'
        },
        'mc': {
          provider: 'Magic Chess: Go Go',
          category: 'Games'
        },
        'mcgg': {
          provider: 'Magic Chess: Go Go',
          category: 'Games'
        },
        'hok': {
          provider: 'Honor of Kings',
          category: 'Games'
        },
        'aov': {
          provider: 'Arena of Valor',
          category: 'Games'
        },
        'lol': {
          provider: 'League of Legends Wild Rift',
          category: 'Games'
        },
        'ab': {
          provider: 'Arena Breakout',
          category: 'Games'
        },
        'coc': {
          provider: 'Clash of Clans',
          category: 'Games'
        },
        'lm': {
          provider: 'Lords Mobile',
          category: 'Games'
        },
        'ff': {
          provider: 'Free Fire',
          category: 'Games'
        },
        'pubg': {
          provider: 'PUBG Mobile',
          category: 'Games'
        },
        'codm': {
          provider: 'Call of Duty Mobile',
          category: 'Games'
        },
        'pb': {
          provider: 'Point Blank',
          category: 'Games'
        },
        'gi': {
          provider: 'Genshin Impact',
          category: 'Games'
        },
        'fcm': {
          provider: 'FC Mobile',
          category: 'Games'
        },

        'byu_data': {
          provider: 'by.U',
          category: 'Data Internet'
        },
        'smartfren_data': {
          provider: 'Smartfren',
          category: 'Data Internet'
        },
        'sf_data': {
          provider: 'Smartfren',
          category: 'Data Internet'
        },
        'telkomsel_data': {
          provider: 'Telkomsel',
          category: 'Data Internet'
        },
        'tsel_data': {
          provider: 'Telkomsel',
          category: 'Data Internet'
        },
        'xl_data': {
          provider: 'XL',
          category: 'Data Internet'
        },
        'axis_data': {
          provider: 'Axis',
          category: 'Data Internet'
        },
        'indosat_data': {
          provider: 'Indosat',
          category: 'Data Internet'
        },
        'isat_data': {
          provider: 'Indosat',
          category: 'Data Internet'
        },
        'im3_data': {
          provider: 'Indosat',
          category: 'Data Internet'
        },
        'tri_data': {
          provider: 'Tri',
          category: 'Data Internet'
        },

        'byu_pulsa': {
          provider: 'by.U',
          category: 'Pulsa Reguler'
        },
        'smartfren_pulsa': {
          provider: 'Smartfren',
          category: 'Pulsa Reguler'
        },
        'sf_pulsa': {
          provider: 'Smartfren',
          category: 'Pulsa Reguler'
        },
        'telkomsel_pulsa': {
          provider: 'Telkomsel',
          category: 'Pulsa Reguler'
        },
        'tsel_pulsa': {
          provider: 'Telkomsel',
          category: 'Pulsa Reguler'
        },
        'xl_pulsa': {
          provider: 'XL',
          category: 'Pulsa Reguler'
        },
        'axis_pulsa': {
          provider: 'Axis',
          category: 'Pulsa Reguler'
        },
        'indosat_pulsa': {
          provider: 'Indosat',
          category: 'Pulsa Reguler'
        },
        'isat_pulsa': {
          provider: 'Indosat',
          category: 'Pulsa Reguler'
        },
        'im3_pulsa': {
          provider: 'Indosat',
          category: 'Pulsa Reguler'
        },
        'tri_pulsa': {
          provider: 'Tri',
          category: 'Pulsa Reguler'
        },

        'dana': {
          provider: 'DANA',
          category: 'E-Money'
        },
        'ovo': {
          provider: 'OVO',
          category: 'E-Money'
        },
        'gopay': {
          provider: 'GO PAY',
          category: 'E-Money'
        },
        'shopeepay': {
          provider: 'SHOPEE PAY',
          category: 'E-Money'
        },
        'spay': {
          provider: 'SHOPEE PAY',
          category: 'E-Money'
        },
        'astrapay': {
          provider: 'AstraPay',
          category: 'E-Money'
        },
        'apay': {
          provider: 'AstraPay',
          category: 'E-Money'
        },
        'linkaja': {
          provider: 'LinkAja',
          category: 'E-Money'
        },
        'sakuku': {
          provider: 'Sakuku',
          category: 'E-Money'
        },
        'doku': {
          provider: 'DOKU',
          category: 'E-Money'
        },

        'pln': {
          provider: 'PLN',
          category: 'Voucher'
        },
        'indomaret': {
          provider: 'INDOMARET',
          category: 'Voucher'
        },
        'alfamart': {
          provider: 'ALFAMART VOUCHER',
          category: 'Voucher'
        },
        'gplay': {
          provider: 'GOOGLE PLAY INDONESIA',
          category: 'Voucher'
        },
        'unipin': {
          provider: 'Unipin Voucher',
          category: 'Voucher'
        },
        'traveloka': {
          provider: 'Traveloka E-Voucher',
          category: 'Voucher'
        },
        'itunes': {
          provider: 'iTunes',
          category: 'Voucher'
        },
        'xbox': {
          provider: 'XBOX',
          category: 'Voucher'
        },
        'ps': {
          provider: 'PLAYSTATION',
          category: 'Voucher'
        },
        'playstation': {
          provider: 'PLAYSTATION',
          category: 'Voucher'
        },
        'vidio_ori': {
          provider: 'Vidio',
          category: 'Voucher'
        },
        'viu_ori': {
          provider: 'Viu',
          category: 'Voucher'
        },
        'spotify_ori': {
          provider: 'SPOTIFY',
          category: 'Voucher'
        },
        'roblox': {
          provider: 'Roblox',
          category: 'Voucher'
        },

        'am': {
          provider: 'Alight Motion',
          category: 'Akun Premium'
        },
        'capcut': {
          provider: 'Capcut',
          category: 'Akun Premium'
        },
        'canva': {
          provider: 'canva',
          category: 'Akun Premium'
        },
        'remini': {
          provider: 'REMINI PRO',
          category: 'Akun Premium'
        },
        'youtube': {
          provider: 'Youtube Premium',
          category: 'Akun Premium'
        },
        'vidio': {
          provider: 'Vidio',
          category: 'Akun Premium'
        },
        'viu': {
          provider: 'Viu',
          category: 'Akun Premium'
        },
        'netflix': {
          provider: 'Netflix',
          category: 'Akun Premium'
        },
        'disney': {
          provider: 'Disney',
          category: 'Akun Premium'
        },
        'bstation': {
          provider: 'BSTATION',
          category: 'Akun Premium'
        },
        'dramabox': {
          provider: 'DRAMABOX',
          category: 'Akun Premium'
        },
        'wetv': {
          provider: 'WETV',
          category: 'Akun Premium'
        },
        'spotify': {
          provider: 'SPOTIFY',
          category: 'Akun Premium'
        }
      };

      const selectedProduct = products[command];
      if (!selectedProduct) return msg.reply('Provider tidak dikenal.');

      const {
        provider,
        category,
        codePrefix
      } = selectedProduct;

      try {
        const result = await getProductsData();

        if (!result || !result.data) {
          return msg.reply('Tidak dapat mengambil data produk. Silakan coba lagi nanti.');
        }

        const lowerCaseProvider = provider.toLowerCase();
        const lowerCaseCategory = category.toLowerCase();

        const filteredProducts = result.data.filter(item => {
          const itemProvider = item.provider ? item.provider.toLowerCase() : '';
          const itemCategory = item.category ? item.category.toLowerCase() : '';

          const matchesProviderCategory = itemProvider === lowerCaseProvider && itemCategory === lowerCaseCategory;

          if (codePrefix) {
            return matchesProviderCategory && item.code.startsWith(codePrefix);
          }

          return matchesProviderCategory;
        });

        if (filteredProducts.length === 0) {
          return msg.reply('Tidak ada produk yang tersedia untuk provider dan kategori ini.');
        }

        filteredProducts.sort((a, b) => {
          const profitA = (config.api.profit / 100) * a.price;
          const finalA = Number(a.price) + Number(Math.ceil(profitA));

          const profitB = (config.api.profit / 100) * b.price;
          const finalB = Number(b.price) + Number(Math.ceil(profitB));

          return finalA - finalB;
        });

        let listText = `*📌 DAFTAR PRODUK ${provider.toUpperCase()} - ${category.toUpperCase()}*\n\n` +
          `*✅ : Tersedia*\n` +
          `*⛔ : Tidak Tersedia*\n\n` +
          `_Ingin melakukan topup? ketik *${prefix}order KODE,TUJUAN*_\n\n`;

        filteredProducts.forEach((item) => {
          const profit = (config.api.profit / 100) * item.price;
          const finalPrice = Number(item.price) + Number(Math.ceil(profit));
          listText += `╭⟬ *${item.status == 'available' ? '✅' : '⛔'} ${item.name}*\n` +
            `┆•  Harga: ${toRupiah(finalPrice)}\n` +
            `┆•  Kode: ${item.code}\n` +
            `┆•  Note: ${item.note}\n` +
            `╰──────────◇\n\n`;
        });

        msg.reply(listText);
      } catch (error) {
        console.error('Error:', error);
        msg.reply('Terjadi kesalahan saat mengambil data produk.');
      }

      break;
    }

    case 'pesan':
    case 'order':
    case 'topup': {
      const [code, ...targets] = parameters(',');
      const target = targets.join('|');

      if (!code || !target) {
        return msg.reply(`Semua parameter (code, target) diperlukan.\n\n*PETUNJUK PENGGUNAAN*

\`Produk game\`
- Format order: ${prefix}${command} KODE,ID
- Contoh: ${prefix}${command} HOK16,1223334782

\`Khusus produk game yang memakai Zone ID/Server\`
- Format order: ${prefix}${command} KODE,ID|SERVER
- Contoh: ${prefix}${command} MLW1,628299715|10135

\`Produk lainnya\`
- Format order: ${prefix}${command} KODE,TUJUAN
- Contoh: ${prefix}${command} S100,083122028438`);
      }

      sendReaction(config.reactions.process);

      try {
        const reffId = generateRandomText(10);
        const senderNumber = msg.sender.split('@')[0];

        const tmpDirPath = path.join(__dirname, 'tmp');
        const tmpFilePath = path.join(tmpDirPath, 'orders.json');

        if (!fs.existsSync(tmpDirPath)) fs.mkdirSync(tmpDirPath, {
          recursive: true
        });
        if (!fs.existsSync(tmpFilePath)) fs.writeFileSync(tmpFilePath, '{}');

        let orderData = {};
        try {
          orderData = JSON.parse(fs.readFileSync(tmpFilePath, 'utf8'));
        } catch (error) {
          console.error(`Gagal membaca file order data: ${error}`);
        }

        const isTransactionLimitReached = config.api.transaction_limit || true;
        if (isTransactionLimitReached && orderData[senderNumber]) {
          sendReaction(config.reactions.failed);
          return msg.reply(`Anda masih memiliki transaksi yang belum selesai. Silakan tunggu hingga pembayaran selesai, kadaluarsa, atau gagal untuk membuat transaksi baru.\n\nUntuk membatalkan transaksi, Anda dapat mengetik *${prefix}cancel*`);
        }

        const date = new Date();
        const currentDate = new Date(date.toLocaleString('en-US', {
          timeZone: config.time_zone
        }));

        // --- Price List ---
        fetch(`${config.api.base_url}/layanan/price_list`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
              api_key: config.api.secret_key,
              type: 'prabayar'
            })
          })
          .then(response => response.json())
          .then(data => {
            if (!data.data) return msg.reply(data.message);

            const produk = data.data.find(item => item.code === code.toUpperCase());
            if (!produk) return msg.reply('Produk tidak ditemukan.');

            const profit = ((config.api.profit / 100) * produk.price) + 400;
            const finalPrice = Number(produk.price) + Math.ceil(profit);
            const produkDetail = `${produk.name} (${produk.code})`;

            const reportText = `📊 *LAPORAN TRANSAKSI* 📊\n\n` +
              `🔍 *Detail Transaksi:*\n` +
              `🔹 *Referensi ID:* ${reffId}\n` +
              `📱 *Nomor WhatsApp:* ${senderNumber}\n\n` +
              `🛒 *Informasi Produk:*\n` +
              `   - 🏷️ *Nama Produk:* ${produk.name}\n` +
              `   - 💰 *Harga (Termasuk PPN):* ${toRupiah(parseInt(finalPrice))}\n` +
              `   - 💵 *Harga (Belum Termasuk PPN):* ${toRupiah(parseInt(produk.price))}\n` +
              `📈 *Profit:* ${toRupiah(parseInt(profit))} (*${config.api.profit}%*)\n\n` +
              `💳 *Petunjuk Penarikan Saldo:*\n` +
              `Untuk menarik saldo profit, gunakan perintah:\n` +
              `🔸 *${prefix}wd_balance*\n` +
              `🌐 Atau akses langsung melalui *Payment Gateway* resmi:\n` +
              `${config.api.base_url}\n\n` +
              `🔐 *Transaksi aman & terjamin!* Terima kasih telah menggunakan script dari kami. 😊`;

            performDeposit(reffId, produkDetail, finalPrice, code, target, profit, reportText);
          })
          .catch(error => {
            sendReaction(config.reactions.failed);
            msg.reply(`Error: ${error.message}`);
            console.error(error);
          });

        // --- Deposit ---
        function performDeposit(reffId, product, nominal, code, target, profit, reportText) {
          fetch(`${config.api.base_url}/deposit/create`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              body: new URLSearchParams({
                reff_id: reffId,
                type: 'ewallet',
                metode: 'QRISFAST',
                nominal: nominal,
                api_key: config.api.secret_key
              })
            })
            .then(response => response.json())
            .then(async data => {
              if (!data.data) return msg.reply(`${data.message}\n\nSebagai alternatif, Anda dapat menggunakan perintah *${prefix + command}v2 ${code.toUpperCase() + ',' + target}* untuk melanjutkan proses pembayaran.`);

              const fee = parseInt(data.data.tambahan) + parseInt(data.data.fee) + parseInt(profit);

              const text = `*TRANSAKSI BERHASIL DIBUAT*\n\n📌 *Detail Pembayaran:*\n🔹 *Kode Pembayaran:* ${data.data.reff_id}\n💰 *Nominal:* ${toRupiah(data.data.nominal)} (Fee: 0.5%)\n🛍️ *Produk:* ${product}\n🆔 *ID/Nomor Tujuan:* ${target}\n⏰ *Dibuat Pada:* ${data.data.created_at}\n\n📜 *Penting!*\nPastikan ID/Nomor Tujuan sudah benar. Ketik: *${prefix}cancel* untuk membatalkan transaksi. Pembayaran akan otomatis dibatalkan dalam *5 menit*!\n\n🔖 *Catatan:*\nBot ini terintegrasi dengan API Payment Gateway. Terima kasih atas kepercayaan Anda!`;
              
			  const qrImage = await QRCode.toBuffer(data.data.qr_string);

              client.sendMessage(jid, {
                image: qrImage,
                caption: text
              }, {
                quoted: msg
              }).then(sentMessage => {
                const msgId = sentMessage.key.id;
                orderData[senderNumber] = {
                  msgId,
                  reffId,
                  payId: data.data.id,
                  createdAt: data.data.created_at
                };
                fs.writeFileSync(tmpFilePath, JSON.stringify(orderData, null, 2));
                checkPaymentStatus(msgId, data.data.id, reffId, code, target, reportText);
              });
            })
            .catch(error => {
              sendReaction(config.reactions.failed);
              msg.reply(`Error: ${error.message}`);
              console.error(error);
            });
        }

        // --- Payment Status ---
        function checkPaymentStatus(msgId, payId, reffId, code, target, reportText) {
          const timeout = setTimeout(() => {
            clearInterval(interval);
            fetch(`${config.api.base_url}/deposit/cancel`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                  id: payId,
                  api_key: config.api.secret_key
                })
              })
              .then(() => {
                deleteMessage(msgId);
                delete orderData[senderNumber];
                fs.writeFileSync(tmpFilePath, JSON.stringify(orderData, null, 2));
                sendReaction(config.reactions.failed);
                msg.reply('⚠️ *Pembayaran Dibatalkan Otomatis* setelah 5 menit tanpa konfirmasi keberhasilan.');
              });
          }, 300000);

          const interval = setInterval(() => {
            fetch(`${config.api.base_url}/deposit/status`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                  id: payId,
                  api_key: config.api.secret_key
                })
              })
              .then(response => response.json())
              .then(response => {
                const data = response.data;
                if (data.status === 'success' || data.status === 'failed') {
                  clearInterval(interval);
                  clearTimeout(timeout);
                  deleteMessage(msgId);
                  delete orderData[senderNumber];
                  fs.writeFileSync(tmpFilePath, JSON.stringify(orderData, null, 2));

                  performTopupTransaction(reffId, code, target);
                  sendReaction(config.reactions.success);
                  msg.reply(`⬣ *Pembayaran Berhasil!*\n\n` +
                    `◉ ID Pembayaran: ${data.reff_id}\n` +
                    `◉ Status: ${data.status}\n` +
                    `◉ Diterima: ${toRupiah(data.get_balance)}\n` +
                    `◉ Tanggal: ${data.created_at}\n\nTerimakasih.`);

                  sendMsgTo(ownerNumber + '@s.whatsapp.net', {
                    text: `Hai ${ownerName} - @${ownerNumber}\n\n${reportText}`,
                    mentions: [`${ownerNumber}@s.whatsapp.net`]
                  });
                } else if (data.status === 'failed' || data.status === 'cancel' || data.status === 'canceled') {
                  clearInterval(interval);
                  deleteMessage(msgId);
                  sendReaction(config.reactions.failed);
                  return msg.reply('Sangat disayangkan sekali. Pembayaran kamu dibatalkan oleh sistem.');
                }
              })
              .catch(error => {
                sendReaction(config.reactions.failed);
                msg.reply(`Error: ${error.message}`);
                console.error(error);
              });
          }, 5000);
        }

        // --- Topup Transaction ---
        function performTopupTransaction(reffId, code, target) {
          fetch(`${config.api.base_url}/transaksi/create`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              body: new URLSearchParams({
                reff_id: reffId,
                code: code.toUpperCase(),
                target: target,
                api_key: config.api.secret_key
              })
            })
            .then(response => response.json())
            .then(data => {
              if (!data.data) return msg.reply(data.message);

              sendReaction(config.reactions.process);
              client.sendMessage(jid, {
                  text: 'Pembelian sedang di proses...'
                }, {
                  quoted: msg
                })
                .then(sentMessage => {
                  const msgId = sentMessage.key.id;
                  checkTransactionStatus(msgId, data.data.id);
                });
            })
            .catch(error => {
              sendReaction(config.reactions.failed);
              msg.reply(`Error: ${error.message}`);
              console.error(error);
            });
        }

        // --- Transaction Status ---
        function checkTransactionStatus(msgId, id) {
          const interval = setInterval(() => {
            fetch(`${config.api.base_url}/transaksi/status`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                  id: id,
                  type: 'prabayar',
                  api_key: config.api.secret_key
                })
              })
              .then(response => response.json())
              .then(response => {
                const data = response.data;

                if (data.status === 'success') {
                  clearInterval(interval);
                  deleteMessage(msgId);
                  sendReaction(config.reactions.success);

                  const text = `⬣ *Pembelian Berhasil!*\n\n` +
                    `◉ ID Transaksi: ${data.reff_id}\n` +
                    `◉ Status: ${data.status}\n` +
                    `◉ Layanan: ${data.layanan}\n` +
                    `◉ Target: ${data.target}\n` +
                    `◉ Serial Number: ${data.sn}\n` +
                    `◉ Tanggal: ${data.created_at}\n\nTerimakasih.`;

                  sendMsgTo(senderNumber + '@s.whatsapp.net', {
                    text
                  });
                  client.sendMessage(jid, {
                    text: 'Pembelian Berhasil!'
                  }, {
                    quoted: msg
                  });

                } else if (data.status === 'cancel' || data.status === 'canceled' || data.status === 'failed') {
                  clearInterval(interval);
                  deleteMessage(msgId);
                  sendReaction(config.reactions.failed);
                  if (data.status === 'failed') msg.reply('Transaksi gagal. Silakan laporkan masalah ini ke owner bot.');
                }
              })
              .catch(error => {
                sendReaction(config.reactions.failed);
                msg.reply(`Error: ${error.message}`);
                console.error(error);
              });
          }, 5000);
        }

      } catch (error) {
        sendReaction(config.reactions.failed);
        msg.reply(`Error: ${error.message}`);
        console.error(error);
      }

      break;
    }
    
    case 'pesanv2':
    case 'orderv2':
    case 'topupv2': {
      const [code, ...targets] = parameters(',');
      const target = targets.join('|');

      if (!code || !target) {
        return msg.reply(`Semua parameter (code, target) diperlukan.\n\n*PETUNJUK PENGGUNAAN*

\`Produk game\`
- Format order: ${prefix}${command} KODE,ID
- Contoh: ${prefix}${command} HOK16,1223334782

\`Khusus produk game yang memakai Zone ID/Server\`
- Format order: ${prefix}${command} KODE,ID|SERVER
- Contoh: ${prefix}${command} MLW1,628299715|10135

\`Produk lainnya\`
- Format order: ${prefix}${command} KODE,TUJUAN
- Contoh: ${prefix}${command} S100,083122028438`);
      }

      sendReaction(config.reactions.process);

      try {
        const reffId = generateRandomText(10);
        const senderNumber = msg.sender.split('@')[0];

        const tmpDirPath = path.join(__dirname, 'tmp');
        const tmpFilePath = path.join(tmpDirPath, 'orders.json');

        if (!fs.existsSync(tmpDirPath)) fs.mkdirSync(tmpDirPath, {
          recursive: true
        });
        if (!fs.existsSync(tmpFilePath)) fs.writeFileSync(tmpFilePath, '{}');

        let orderData = {};
        try {
          orderData = JSON.parse(fs.readFileSync(tmpFilePath, 'utf8'));
        } catch (error) {
          console.error(`Gagal membaca file order data: ${error}`);
        }

        const isTransactionLimitReached = config.api.transaction_limit || true;
        if (isTransactionLimitReached && orderData[senderNumber]) {
          sendReaction(config.reactions.failed);
          return msg.reply(`Anda masih memiliki transaksi yang belum selesai. Silakan tunggu hingga pembayaran selesai, kadaluarsa, atau gagal untuk membuat transaksi baru.\n\nUntuk membatalkan transaksi, Anda dapat mengetik *${prefix}cancel*`);
        }

        const date = new Date();
        const currentDate = new Date(date.toLocaleString('en-US', {
          timeZone: config.time_zone
        }));

        // --- Price List ---
        fetch(`${config.api.base_url}/layanan/price_list`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
              api_key: config.api.secret_key,
              type: 'prabayar'
            })
          })
          .then(response => response.json())
          .then(data => {
            if (!data.data) return msg.reply(data.message);

            const produk = data.data.find(item => item.code === code.toUpperCase());
            if (!produk) return msg.reply('Produk tidak ditemukan.');

            const profit = ((config.api.profit / 100) * produk.price) + 1200;
            const finalPrice = Number(produk.price) + Math.ceil(profit);
            const produkDetail = `${produk.name} (${produk.code})`;

            const reportText = `📊 *LAPORAN TRANSAKSI* 📊\n\n` +
              `🔍 *Detail Transaksi:*\n` +
              `🔹 *Referensi ID:* ${reffId}\n` +
              `📱 *Nomor WhatsApp:* ${senderNumber}\n\n` +
              `🛒 *Informasi Produk:*\n` +
              `   - 🏷️ *Nama Produk:* ${produk.name}\n` +
              `   - 💰 *Harga (Termasuk PPN):* ${toRupiah(parseInt(finalPrice))}\n` +
              `   - 💵 *Harga (Belum Termasuk PPN):* ${toRupiah(parseInt(produk.price))}\n` +
              `📈 *Profit:* ${toRupiah(parseInt(profit))} (*${config.api.profit}%*)\n\n` +
              `💳 *Petunjuk Penarikan Saldo:*\n` +
              `Untuk menarik saldo profit, gunakan perintah:\n` +
              `🔸 *${prefix}wd_balance*\n` +
              `🌐 Atau akses langsung melalui *Payment Gateway* resmi:\n` +
              `${config.api.base_url}\n\n` +
              `🔐 *Transaksi aman & terjamin!* Terima kasih telah menggunakan script dari kami. 😊`;

            performDeposit(reffId, produkDetail, finalPrice, code, target, profit, reportText);
          })
          .catch(error => {
            sendReaction(config.reactions.failed);
            msg.reply(`Error: ${error.message}`);
            console.error(error);
          });

        // --- Deposit ---
        function performDeposit(reffId, product, nominal, code, target, profit, reportText) {
          fetch(`${config.api.base_url}/deposit/create`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              body: new URLSearchParams({
                reff_id: reffId,
                type: 'ewallet',
                metode: 'QRIS',
                nominal: nominal,
                api_key: config.api.secret_key
              })
            })
            .then(response => response.json())
            .then(async data => {
              if (!data.data) return msg.reply(data.message);

              const fee = parseInt(data.data.tambahan) + parseInt(data.data.fee) + parseInt(profit);

              const text = `*TRANSAKSI BERHASIL DIBUAT*\n\n📌 *Detail Pembayaran:*\n🔹 *Kode Pembayaran:* ${data.data.reff_id}\n💰 *Nominal:* ${toRupiah(data.data.nominal)} (Fee: 0.5% + Rp 1.000)\n🛍️ *Produk:* ${product}\n🆔 *ID/Nomor Tujuan:* ${target}\n⏰ *Dibuat Pada:* ${data.data.created_at}\n\n📜 *Penting!*\nPastikan ID/Nomor Tujuan sudah benar. Ketik: *${prefix}cancel* untuk membatalkan transaksi. Pembayaran akan otomatis dibatalkan dalam *5 menit*!\n\n🔖 *Catatan:*\nBot ini terintegrasi dengan API Payment Gateway resmi dari ${config.api.base_url}. Terima kasih atas kepercayaan Anda!`;
              
			  const qrImage = await QRCode.toBuffer(data.data.qr_string);

              client.sendMessage(jid, {
                image: qrImage,
                caption: text
              }, {
                quoted: msg
              }).then(sentMessage => {
                const msgId = sentMessage.key.id;
                orderData[senderNumber] = {
                  msgId,
                  reffId,
                  payId: data.data.id,
                  createdAt: data.data.created_at
                };
                fs.writeFileSync(tmpFilePath, JSON.stringify(orderData, null, 2));
                checkPaymentStatus(msgId, data.data.id, reffId, code, target, reportText);
              });
            })
            .catch(error => {
              sendReaction(config.reactions.failed);
              msg.reply(`Error: ${error.message}`);
              console.error(error);
            });
        }

        // --- Payment Status (DIUPDATE) ---
function checkPaymentStatus(msgId, payId, reffId, code, target, reportText, senderNumber) {
  const timeout = setTimeout(() => {
    clearInterval(interval);
    // Cancel deposit jika timeout 5 menit
    fetch(`${config.api.base_url}/deposit/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ id: payId, api_key: config.api.secret_key })
      })
      .then(() => {
        deleteMessage(msgId);
        delete orderData[senderNumber];
        fs.writeFileSync(tmpFilePath, JSON.stringify(orderData, null, 2));
        sendReaction(config.reactions.failed);
        msg.reply('⚠️ *Pembayaran Dibatalkan Otomatis* setelah 5 menit tanpa konfirmasi keberhasilan.');
      })
      .catch(err => {
        console.error('Error cancel deposit timeout:', err);
      });
  }, 300000); // 5 menit

  const interval = setInterval(() => {
    fetch(`${config.api.base_url}/deposit/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ id: payId, api_key: config.api.secret_key })
      })
      .then(res => res.json())
      .then(response => {
        const data = response.data;
        // Jika deposit benar-benar sukses (pembayaran diterima oleh gateway)
        if (data.status === 'success') {
          // hentikan cek deposit.status (tetap jangan hapus orderData dulu, tunggu instant payout selesai)
          clearInterval(interval);
          clearTimeout(timeout);

          // beri tahu user bahwa deposit terdeteksi sukses dan sedang mencoba pencairan instant
          sendReaction(config.reactions.process);
          msg.reply(`✅ Pembayaran terdeteksi sukses. Sedang meminta pencairan *instant* (H+0) untuk ID: ${data.reff_id}`);

          // lakukan request instant payout dan polling hasilnya
          handleInstantPayout(payId, reffId, code, target, reportText, msgId, senderNumber);
        } else if (data.status === 'failed' || data.status === 'cancel' || data.status === 'canceled') {
          clearInterval(interval);
          clearTimeout(timeout);
          deleteMessage(msgId);
          delete orderData[senderNumber];
          fs.writeFileSync(tmpFilePath, JSON.stringify(orderData, null, 2));
          sendReaction(config.reactions.failed);
          return msg.reply('Sangat disayangkan sekali. Pembayaran kamu dibatalkan oleh sistem.');
        }
        // jika masih pending/processing, terus cek
      })
      .catch(error => {
        sendReaction(config.reactions.failed);
        msg.reply(`Error: ${error.message}`);
        console.error(error);
      });
  }, 5000);
}

// --- Helper: request instant payout & poll until instant success/fail ---
function handleInstantPayout(payId, reffId, code, target, reportText, msgId, senderNumber) {
  // pertama, langsung request pencairan instant (action=true)
  fetch(`${config.api.base_url}/deposit/instant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        api_key: config.api.secret_key,
        id: payId,
        action: 'true' // lakukan pencairan
      })
    })
    .then(res => res.json())
    .then(async instantResp => {
      if (!instantResp || instantResp.status !== true || !instantResp.data) {
        // gagal memicu instant: fallback -> hapus order, beri tahu user
        deleteMessage(msgId);
        delete orderData[senderNumber];
        fs.writeFileSync(tmpFilePath, JSON.stringify(orderData, null, 2));
        sendReaction(config.reactions.failed);
        return msg.reply(`⚠️ Gagal memproses pencairan instant: ${instantResp.message || 'Unknown error'}`);
      }

      const instData = instantResp.data;
      // Jika API langsung mengembalikan success pada instant
      if (instData.status === 'success') {
        // hapus pesan QR, update data, panggil performTopupTransaction
        deleteMessage(msgId);
        delete orderData[senderNumber];
        fs.writeFileSync(tmpFilePath, JSON.stringify(orderData, null, 2));
        sendReaction(config.reactions.success);
        msg.reply(`✅ Pencairan instant berhasil. Melanjutkan proses topup... (ID: ${instData.id})`);

        // lanjutkan proses transaksi ke provider
        performTopupTransaction(reffId, code, target);

        // kirim laporan ke owner
        sendMsgTo(ownerNumber + '@s.whatsapp.net', {
          text: `Hai ${ownerName} - @${ownerNumber}\n\n${reportText}`,
          mentions: [`${ownerNumber}@s.whatsapp.net`]
        });
        return;
      }

      // Jika instant masih "processing", lakukan polling /deposit/instant sampai success atau timeout
      if (instData.status === 'processing') {
        msg.reply(`⏳ Pencairan instant dalam proses. Akan dipantau hingga selesai (ID: ${payId}).`);
        const pollTimeout = setTimeout(() => {
          clearInterval(pollInterval);
          // expire: anggap gagal, kembalikan atau beri tahu user
          deleteMessage(msgId);
          delete orderData[senderNumber];
          fs.writeFileSync(tmpFilePath, JSON.stringify(orderData, null, 2));
          sendReaction(config.reactions.failed);
          msg.reply('⚠️ Pencairan instant tidak selesai dalam waktu yang ditentukan. Silakan hubungi support.');
        }, 120000); // polling timeout 2 menit (ubah sesuai kebutuhan)

        const pollInterval = setInterval(() => {
          fetch(`${config.api.base_url}/deposit/instant`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                api_key: config.api.secret_key,
                id: payId,
                action: 'false' // cek status biaya/pencairan tanpa memicu lagi
              })
            })
            .then(r => r.json())
            .then(pollResp => {
              if (!pollResp || !pollResp.data) return; // terus polling
              const p = pollResp.data;
              if (p.status === 'success') {
                clearInterval(pollInterval);
                clearTimeout(pollTimeout);

                // sukses -> lanjut topup
                deleteMessage(msgId);
                delete orderData[senderNumber];
                fs.writeFileSync(tmpFilePath, JSON.stringify(orderData, null, 2));
                sendReaction(config.reactions.success);
                msg.reply(`✅ Pencairan instant selesai. Melanjutkan proses topup... (ID: ${payId})`);

                performTopupTransaction(reffId, code, target);

                sendMsgTo(ownerNumber + '@s.whatsapp.net', {
                  text: `Hai ${ownerName} - @${ownerNumber}\n\n${reportText}`,
                  mentions: [`${ownerNumber}@s.whatsapp.net`]
                });
              } else if (p.status === 'failed' || p.status === 'cancel' || p.status === 'canceled') {
                clearInterval(pollInterval);
                clearTimeout(pollTimeout);

                deleteMessage(msgId);
                delete orderData[senderNumber];
                fs.writeFileSync(tmpFilePath, JSON.stringify(orderData, null, 2));
                sendReaction(config.reactions.failed);
                msg.reply('⚠️ Pencairan instant gagal atau dibatalkan. Silakan hubungi admin untuk tindak lanjut.');
              }
              // jika masih processing -> tunggu polling berikutnya
            })
            .catch(err => {
              console.error('Error polling deposit/instant:', err);
            });
        }, 5000); // polling tiap 5 detik
      } else {
        // status / behavior lain
        deleteMessage(msgId);
        delete orderData[senderNumber];
        fs.writeFileSync(tmpFilePath, JSON.stringify(orderData, null, 2));
        sendReaction(config.reactions.failed);
        msg.reply(`⚠️ Respon pencairan instant tidak terduga: ${JSON.stringify(instData)}`);
      }
    })
    .catch(err => {
      console.error('Error calling deposit/instant:', err);
      deleteMessage(msgId);
      delete orderData[senderNumber];
      fs.writeFileSync(tmpFilePath, JSON.stringify(orderData, null, 2));
      sendReaction(config.reactions.failed);
      msg.reply(`Error saat memproses pencairan instant: ${err.message}`);
    });
}

        // --- Topup Transaction ---
        function performTopupTransaction(reffId, code, target) {
          fetch(`${config.api.base_url}/transaksi/create`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              body: new URLSearchParams({
                reff_id: reffId,
                code: code.toUpperCase(),
                target: target,
                api_key: config.api.secret_key
              })
            })
            .then(response => response.json())
            .then(data => {
              if (!data.data) return msg.reply(data.message);

              sendReaction(config.reactions.process);
              client.sendMessage(jid, {
                  text: 'Pembelian sedang di proses...'
                }, {
                  quoted: msg
                })
                .then(sentMessage => {
                  const msgId = sentMessage.key.id;
                  checkTransactionStatus(msgId, data.data.id);
                });
            })
            .catch(error => {
              sendReaction(config.reactions.failed);
              msg.reply(`Error: ${error.message}`);
              console.error(error);
            });
        }

        // --- Transaction Status ---
        function checkTransactionStatus(msgId, id) {
          const interval = setInterval(() => {
            fetch(`${config.api.base_url}/transaksi/status`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                  id: id,
                  type: 'prabayar',
                  api_key: config.api.secret_key
                })
              })
              .then(response => response.json())
              .then(response => {
                const data = response.data;

                if (data.status === 'success') {
                  clearInterval(interval);
                  deleteMessage(msgId);
                  sendReaction(config.reactions.success);

                  const text = `⬣ *Pembelian Berhasil!*\n\n` +
                    `◉ ID Transaksi: ${data.reff_id}\n` +
                    `◉ Status: ${data.status}\n` +
                    `◉ Layanan: ${data.layanan}\n` +
                    `◉ Target: ${data.target}\n` +
                    `◉ Serial Number: ${data.sn}\n` +
                    `◉ Tanggal: ${data.created_at}\n\nTerimakasih.`;

                  sendMsgTo(senderNumber + '@s.whatsapp.net', {
                    text
                  });
                  client.sendMessage(jid, {
                    text: 'Pembelian Berhasil!'
                  }, {
                    quoted: msg
                  });

                } else if (data.status === 'cancel' || data.status === 'canceled' || data.status === 'failed') {
                  clearInterval(interval);
                  deleteMessage(msgId);
                  sendReaction(config.reactions.failed);
                  if (data.status === 'failed') msg.reply('Transaksi gagal. Silakan laporkan masalah ini ke owner bot.');
                }
              })
              .catch(error => {
                sendReaction(config.reactions.failed);
                msg.reply(`Error: ${error.message}`);
                console.error(error);
              });
          }, 5000);
        }

      } catch (error) {
        sendReaction(config.reactions.failed);
        msg.reply(`Error: ${error.message}`);
        console.error(error);
      }

      break;
    }

    case 'batal':
    case 'cancel': {
      try {
        const tmpFilePath = path.join(__dirname, 'tmp', 'orders.json');
        let orderData = {};
        if (fs.existsSync(tmpFilePath)) {
          orderData = JSON.parse(fs.readFileSync(tmpFilePath, 'utf8'));
        }

        if (!orderData[senderNumber]) {
          return msg.reply('Tidak ada transaksi yang terkait dengan nomor pengirim ini.');
        }

        const {
          msgId,
          payId,
          reffId
        } = orderData[senderNumber];

        delete orderData[senderNumber];
        fs.writeFileSync(tmpFilePath, JSON.stringify(orderData, null, 2));

        deleteMessage(msgId);
        sendReaction(config.reactions.success);
        msg.reply(`⚠️ Pembayaran dengan reffId ${reffId} dan payId ${payId} telah dibatalkan.`);

        fetch(`${config.api.base_url}/deposit/cancel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            id: payId,
            api_key: config.api.secret_key
          })
        }).catch(err => {
          console.error(err.message);
          sendReaction(config.reactions.failed);
          msg.reply(`Gagal membatalkan deposit: ${err.message}`);
        });

      } catch (error) {
        sendReaction(config.reactions.failed);
        msg.reply(`Error: ${error.message}`);
        console.error(error);
      }
      break;
    }

    case 'beli':
    case 'buy': {
      if (!(isOwner || isMe)) return msg.reply('❌ Kamu tidak memiliki izin untuk menggunakan fitur ini.');
      const [code, ...targets] = parameters(',');
      const target = targets.join(',');
      if (!code || !target) {
        return msg.reply(`Semua parameter (code, target) diperlukan.\n\nContoh: ${prefix}${command} ML3,628299715|10135`);
      }
      sendReaction(config.reactions.process);

      try {
        const reffId = generateRandomText(10);

        const response = await fetch(`${config.api.base_url}/transaksi/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            reff_id: reffId,
            code: code.toUpperCase(),
            target: target,
            api_key: config.api.secret_key
          })
        });

        const data = await response.json();
        if (!data.data) return msg.reply(data.message);

        const text = `Pembelian sedang di prosess:\n\nLayanan: ${data.data.layanan}\nTarget: ${data.data.target}\nReff id: ${data.data.reff_id}\nNominal: ${toRupiah(data.data.price)}\nDibuat pada: ${data.data.created_at}`;
        client.sendMessage(jid, {
          text
        }, {
          quoted: msg
        }).then(sentMessage => {
          checkTransactionStatus(data.data.id, sentMessage.key.id);
        });

      } catch (error) {
        sendReaction(config.reactions.failed);
        msg.reply(`Error: ${error.message}`);
        console.error(error.message);
      }

      async function checkTransactionStatus(payId, msgId) {
        const interval = setInterval(async () => {
          try {
            const response = await fetch(`${config.api.base_url}/transaksi/status`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              body: new URLSearchParams({
                id: payId,
                type: 'prabayar',
                api_key: config.api.secret_key
              })
            });

            const result = await response.json();
            const data = result.data;
            if (data.status === 'success') {
              clearInterval(interval);
              sendReaction(config.reactions.success);
              const text = `⬣ *Pembelian Berhasil!*\n\n` +
                `◉ ID Transaksi: ${data.reff_id}\n` +
                `◉ Status: ${data.status}\n` +
                `◉ Layanan: ${data.layanan}\n` +
                `◉ Target: ${data.target}\n` +
                `◉ Serial Number: ${data.sn}\n` +
                `◉ Tanggal: ${data.created_at}\n\nTerimakasih.`;

              sendMsgTo(senderNumber + '@s.whatsapp.net', {
                text
              });
              client.sendMessage(jid, {
                text: 'Pembelian Berhasil!'
              }, {
                quoted: msg
              });
              deleteMessage(msgId);
            } else if (data.data.status === 'failed') {
              clearInterval(interval);
              sendReaction(config.reactions.failed);
              msg.reply('Transaksi kamu failed. Silahkan minta reffund kepada owner bot.');
              deleteMessage(msgId);
            }
          } catch (error) {
            sendReaction(config.reactions.failed);
            msg.reply(`Error: ${error.message}`);
            console.error(error.message);
          }
        }, 5000);
      }
      break;
    }

    case 'deposito':
    case 'deposit':
    case 'depo': {
      if (!(isOwner || isMe)) return msg.reply('❌ Kamu tidak memiliki izin untuk menggunakan fitur ini.');
      const [nominal] = parameters();
      if (!nominal) return msg.reply(`Example: ${prefix}${command} 500.`);
      if (nominal < 500) return msg.reply('Jumlah minimal adalah: 500.');
      sendReaction(config.reactions.process);

      try {
        const reffId = generateRandomText(10);

        const response = await fetch(`${config.api.base_url}/deposit/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            reff_id: reffId,
            type: 'ewallet',
            metode: 'QRISFAST',
            nominal: nominal,
            api_key: config.api.secret_key
          })
        });

        const data = await response.json();
        if (!data.data) return msg.reply(data.message);

        const text = `Reff id: ${data.data.reff_id}\nNominal: ${toRupiah(data.data.nominal)}\nFee: ${toRupiah(data.data.fee)}\nDiterima: ${toRupiah(data.data.get_balance)}\nDibuat pada: ${data.data.created_at}\n\nNote: Pembayaran akan otomatis dibatalkan 5 menit lagi!`;
        
        const qrImage = await QRCode.toBuffer(data.data.qr_string);
        
        client.sendMessage(jid, {
          image: qrImage,
          caption: text
        }, {
          quoted: msg
        }).then(sentMessage => {
          checkPaymentStatus(data.data.id, sentMessage.key.id);
          setTimeout(() => {
            deleteMessage(sentMessage.key.id);
          }, 300000);
        });

        async function checkPaymentStatus(payId, msgId) {
          const timeout = setTimeout(async () => {
            clearInterval(interval);
            await fetch(`${config.api.base_url}/deposit/cancel`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              body: new URLSearchParams({
                id: payId,
                api_key: config.api.secret_key
              })
            });
            sendReaction(config.reactions.failed);
            msg.reply(`⚠️ *Pembayaran Dibatalkan Otomatis* setelah 5 menit tanpa konfirmasi keberhasilan.`);
          }, 300000);

          const interval = setInterval(async () => {
            try {
              const response = await fetch(`${config.api.base_url}/deposit/status`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                  id: payId,
                  api_key: config.api.secret_key
                })
              });

              const data = await response.json();
              if (data.data.status === 'success') {
                clearInterval(interval);
                clearTimeout(timeout);
                deleteMessage(msgId);
                sendReaction(config.reactions.success);
                msg.reply(`⬣ *Pembayaran Berhasil!*\n\n◉ ID Pembayaran: ${data.data.reff_id}\n◉ Status: ${data.data.status}\n◉ Diterima: ${toRupiah(data.data.get_balance)}\n◉ Tanggal: ${data.data.created_at}\n\nTerimakasih.`);
              } else if (data.data.status === 'failed' || data.data.status === 'cancel') {
                clearInterval(interval);
                deleteMessage(msgId);
                sendReaction(config.reactions.failed);
                msg.reply('Pembayaran kamu gagal/dibatalkan oleh sistem.');
              }
            } catch (error) {
              sendReaction(config.reactions.failed);
              msg.reply(`Error: ${error.message}`);
              console.error(error.message);
            }
          }, 5000);
        }

      } catch (error) {
        sendReaction(config.reactions.failed);
        msg.reply(`Error: ${error.message}`);
        console.error(error);
      }
      break;
    }

    case 'transfer':
    case 'withdraw':
    case 'wd_balance':
    case 'tarik_saldo': {
      if (!(isOwner || isMe)) return msg.reply('❌ Kamu tidak memiliki izin untuk menggunakan fitur ini.');
      const [nominal, bank_code, destination_number] = parameters(',');
      if (!nominal) return msg.reply(`Example: ${prefix}${command} 3000.`);
      if (nominal < 3000) return msg.reply('Jumlah minimal adalah: 3000.');
      //const finalNominal = parseInt(nominal) - 2000;
      sendReaction(config.reactions.process);

      try {
        const reffId = generateRandomText(10);

        const response = await fetch(`${config.api.base_url}/transfer/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            api_key: config.api.secret_key,
            ref_id: reffId,
            kode_bank: bank_code || config.api.wd_balance.bank_code,
            nomor_akun: destination_number || config.api.wd_balance.destination_number,
            nama_pemilik: config.owner_name,
            nominal: nominal,
            email: 'inovixa.technologies.solution@gmail.com',
            phone: config.api.wd_balance.destination_number,
            note: 'Withdraw Saldo ID 29029'
          })
        });

        const data = await response.json();
        if (!data.data) return msg.reply(data.message);

        const text = `Reff id: ${data.data.reff_id}\nNama: ${data.data.nama}\nKode Bank: ${config.api.wd_balance.bank_code}\nNo Tujuan: ${data.data.nomor_tujuan}\nNominal: ${toRupiah(data.data.nominal)}\nFee: ${toRupiah(data.data.fee)}\nTotal: ${toRupiah(data.data.total)}\nDibuat pada: ${data.data.created_at}`;
        client.sendMessage(jid, {
          text
        }, {
          quoted: msg
        }).then(sentMessage => {
          checkPaymentStatus(data.data.id, sentMessage.key.id);
        });

        async function checkPaymentStatus(payId, msgId) {
          const interval = setInterval(async () => {
            const response = await fetch(`${config.api.base_url}/transfer/status`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              body: new URLSearchParams({
                id: payId,
                api_key: config.api.secret_key
              })
            });

            const data = await response.json();
            if (data.data.status === 'success') {
              clearInterval(interval);
              sendReaction(config.reactions.success);
              msg.reply('Berhasil melakukan transfer.');
            } else if (data.data.status === 'failed' || data.data.status === 'cancel') {
              clearInterval(interval);
              sendReaction(config.reactions.failed);
              msg.reply('Gagal melakukan transfer.');
            }
          }, 5000);
        }

      } catch (error) {
        sendReaction(config.reactions.failed);
        msg.reply(`Error: ${error.message}`);
        console.error(error.message);
      }
      break;
    }
    
case 'tarik_saldo_provider': {
  if (!(isOwner || isMe)) return msg.reply('❌ Kamu tidak memiliki izin untuk menggunakan fitur ini.');
  const [product_code, bank_code, destination_number] = parameters(',');
  if (!product_code) return msg.reply(`Example: ${prefix}${command} ML30, DANA, 083122028438.`);
  sendReaction(config.reactions.process);

  try {
    const input = product_code.toString().trim();
    let nominal;

    if (/^\d+$/.test(input)) {
      nominal = parseInt(input, 10);
    } else {
      const productsResult = await getProductsData();
      if (!productsResult || !productsResult.data) {
        sendReaction(config.reactions.failed);
        return msg.reply('Tidak dapat mengambil data produk. Silakan coba lagi nanti.');
      }

      const found = productsResult.data.find(p => p.code && p.code.toLowerCase() === input.toLowerCase());

      if (!found) {
        sendReaction(config.reactions.failed);
        return msg.reply(`Kode produk "${input}" tidak ditemukan. Pastikan kode benar.`);
      }

      const rawPrice = Number(found.price);
      const profit = Math.ceil((config.api.profit / 100) * rawPrice);
      nominal = rawPrice + profit;

      await msg.reply(`Menggunakan produk: ${found.name}\nHarga dasar: ${toRupiah(rawPrice)}\nProfit: ${toRupiah(profit)}\nNominal yang akan ditarik: ${toRupiah(nominal)}\nBiaya penarikan: ${toRupiah(2000)}`);
    }

    if (nominal < 3000) {
      sendReaction(config.reactions.failed);
      return msg.reply('Jumlah minimal adalah: 3000.');
    }

    const reffId = generateRandomText(10);

    const response = await fetch(`${config.api.base_url}/transfer/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        api_key: config.api.secret_key,
        ref_id: reffId,
        kode_bank: bank_code ? bank_code.trim() : (config.api.wd_balance.bank_code || ''),
        nomor_akun: destination_number ? destination_number.trim() : (config.api.wd_balance.destination_number || ''),
        nama_pemilik: config.owner_name,
        nominal: String(nominal),
        email: 'inovixa.technologies.solution@gmail.com',
        phone: config.api.wd_balance.destination_number,
        note: 'Withdraw Saldo ID 29029'
      })
    });

    const data = await response.json();
    if (!data.data) {
      sendReaction(config.reactions.failed);
      return msg.reply(data.message || 'Terjadi kesalahan saat membuat transfer.');
    }

    const text = `Reff id: ${data.data.reff_id}\nNama: ${data.data.nama}\nKode Bank: ${config.api.wd_balance.bank_code}\nNo Tujuan: ${data.data.nomor_tujuan}\nNominal: ${toRupiah(data.data.nominal)}\nFee: ${toRupiah(data.data.fee)}\nTotal: ${toRupiah(data.data.total)}\nDibuat pada: ${data.data.created_at}`;
    client.sendMessage(jid, { text }, { quoted: msg }).then(sentMessage => {
      checkPaymentStatus(data.data.id, sentMessage.key.id);
    });

    async function checkPaymentStatus(payId, msgId) {
      const interval = setInterval(async () => {
        const response = await fetch(`${config.api.base_url}/transfer/status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            id: payId,
            api_key: config.api.secret_key
          })
        });

        const statusData = await response.json();
        if (!statusData.data) return;
        if (statusData.data.status === 'success') {
          clearInterval(interval);
          sendReaction(config.reactions.success);
          msg.reply('Berhasil melakukan transfer.');
        } else if (statusData.data.status === 'failed' || statusData.data.status === 'cancel') {
          clearInterval(interval);
          sendReaction(config.reactions.failed);
          msg.reply('Gagal melakukan transfer.');
        }
      }, 5000);
    }

  } catch (error) {
    sendReaction(config.reactions.failed);
    msg.reply(`Error: ${error.message}`);
    console.error(error);
  }
  break;
}

    case 'saldo':
    case 'check_balance':
    case 'cek_saldo':
    case 'balance': {
      if (!(isOwner || isMe)) return msg.reply('❌ Kamu tidak memiliki izin untuk menggunakan fitur ini.');
      sendReaction(config.reactions.process);

      try {
        const response = await fetch(`${config.api.base_url}/get_profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            api_key: config.api.secret_key
          })
        });

        const data = await response.json();
        sendReaction(config.reactions.success);
        msg.reply(`Jumlah saldo Anda adalah: ${toRupiah(data.data.balance)}`);
      } catch (error) {
        sendReaction(config.reactions.failed);
        msg.reply(`Error: ${error.message}`);
        console.error(error.message);
      }
      break;
    }

    case 'tambah_produk':
    case 'add_product': {
      if (!(isOwner || isMe)) return msg.reply('❌ Kamu tidak memiliki izin untuk menggunakan fitur ini.');
      const [name, code, price, note] = parameters(',');
      if (!name || !code || !price || !note) {
        return msg.reply(`Example: ${prefix}${command} Produk 1, one, 100, satu`);
      }
      addProduct(name, code, price, note);
      break;
    }    
    case 'tambah_stok':
    case 'add_stock': {
      if (!(isOwner || isMe)) return msg.reply('❌ Kamu tidak memiliki izin untuk menggunakan fitur ini.');
      const [product, email, password, note] = parameters(',');
      if (!product || !email || !password || !note) {
        return msg.reply(`Example: ${prefix}${command} one, one@satu.com, password1, satu`);
      }
      
      const username = '';
      addStockProduct(product, username, password, email, note);
      break;
    }

    case 'perbarui_produk':
    case 'update_product': {
      if (!(isOwner || isMe)) return msg.reply('❌ Kamu tidak memiliki izin untuk menggunakan fitur ini.');
      const [code, newName, newPrice, newNote] = parameters(',');
      if (!code || !newName || !newPrice || !newNote) {
        return msg.reply(`Example: ${prefix}${command} one, Produk Baru, 12000, catatan baru`);
      }

      let products = readJson(tmpFilePathProducts);
      const productIndex = products.findIndex(p => p.code === code);

      if (productIndex === -1) return msg.reply(`Produk dengan kode "${code}" tidak ditemukan.`);

      products[productIndex].name = newName;
      products[productIndex].price = Number(newPrice);
      products[productIndex].note = newNote;

      writeJson(tmpFilePathProducts, products);
      msg.reply(`✅ Produk dengan kode "${code}" berhasil diperbarui.`);
      break;
    }

    case 'hapus_produk':
    case 'delete_product': {
      if (!(isOwner || isMe)) return msg.reply('❌ Kamu tidak memiliki izin untuk menggunakan fitur ini.');
      const [code] = parameters(',');
      if (!code) return msg.reply(`Example: ${prefix}${command} one`);

      let products = readJson(tmpFilePathProducts);
      const productIndex = products.findIndex(p => p.code === code);
      if (productIndex === -1) return msg.reply(`Produk dengan kode "${code}" tidak ditemukan.`);

      let stocks = readJson(tmpFilePathStocks);
      stocks = stocks.filter(stock => !stock[code]);
      writeJson(tmpFilePathStocks, stocks);

      const deleted = products.splice(productIndex, 1);
      writeJson(tmpFilePathProducts, products);

      msg.reply(`✅ Produk "${deleted[0].name}" berhasil dihapus.`);
      break;
    }

    case 'hapus_semua_produk':
    case 'delete_all_products': {
      if (!(isOwner || isMe)) return msg.reply('❌ Kamu tidak memiliki izin untuk menggunakan fitur ini.');

      const [confirm] = parameters(',');
      if (confirm !== 'confirm') {
        return msg.reply(`⚠️ PERINGATAN: Ini akan menghapus SEMUA produk dan stok terkait! 
    
Ketik: ${prefix}${command} confirm 
untuk mengonfirmasi penghapusan total.`);
      }

      writeJson(tmpFilePathProducts, []);
      writeJson(tmpFilePathStocks, []);

      msg.reply('✅ Berhasil menghapus semua produk dan data stok terkait.');
      break;
    }

    case 'hapus_stok':
    case 'delete_stock': {
      if (!(isOwner || isMe)) return msg.reply('❌ Kamu tidak memiliki izin untuk menggunakan fitur ini.');
      const [identifier] = parameters(',');
      if (!identifier) return msg.reply(`Example: ${prefix}${command} [nama_produk atau kode_produk]`);

      let products = readJson(tmpFilePathProducts);

      const productIndex = products.findIndex(p =>
        p.code.toLowerCase() === identifier.toLowerCase() ||
        p.name.toLowerCase() === identifier.toLowerCase()
      );

      if (productIndex === -1) return msg.reply(`❌ Produk dengan identifier "${identifier}" tidak ditemukan.`);

      let stocks = readJson(tmpFilePathStocks);
      const initialLength = stocks.length;
      const productCode = products[productIndex].code;
      stocks = stocks.filter(stock => !stock.hasOwnProperty(productCode));

      products[productIndex].available = 0;

      writeJson(tmpFilePathStocks, stocks);
      writeJson(tmpFilePathProducts, products);

      const deletedCount = initialLength - stocks.length;
      msg.reply(`✅ Berhasil menghapus ${deletedCount} stok untuk produk "${products[productIndex].name}" (${productCode}) dan mengatur available menjadi 0.`);
      break;
    }

    case 'stok':
    case 'stock':
    case 'stocks': {
      const products = readJson(tmpFilePathProducts);
      const stocks = readJson(tmpFilePathStocks);

      if (!Array.isArray(products) || products.length === 0) {
        return msg.reply('Belum ada produk tersedia.');
      }

      let teks = '╭───〔 *Daftar Produk Tersedia* 〕\n';

      for (const product of products) {
        const {
          name,
          price,
          code,
          note,
          available,
          sold
        } = product;

        teks += `├───〔  *${name}*  〕─\n`;
        teks += `│\n`;
        teks += `│ *Harga:* Rp ${price}\n`;
        teks += `│ *Kode:* ${code}\n`;
        teks += `│ *Stok:* ${available} akun\n`;
        teks += `│ *Terjual:* ${sold}\n`;
        teks += `│ *Note:* ${note}\n`;
        teks += `├──────────────┾•ิ.•┽\n`;
        teks += `│   *Cara membeli:*  \n`;
        teks += `│  Ketik *${prefix}pay ${code},jumlah*\n`;
        teks += `│  Contoh: *${prefix}pay ${code},1*\n`;
        teks += `│\n`;
        teks += `╰━━━━━━━━━━━━━━━━┅•ิ.•ஐ\n`;
      }

      msg.reply(teks);
      break;
    }

    case 'bayar':
    case 'pay':
    case 'pays': {
      const [productCode, amountStr] = parameters(',');
      const amount = parseInt(amountStr);

      if (!productCode || !amount || isNaN(amount) || amount < 1) {
        return msg.reply(`Example: ${prefix}${command} one,1`);
      }

      const products = readJson(tmpFilePathProducts);
      const stocks = readJson(tmpFilePathStocks);

      const product = products.find(p => p.code === productCode);
      if (!product) return msg.reply(`Produk dengan kode "${productCode}" tidak ditemukan.`);

      if (product.available < amount) {
        return msg.reply(`Stok tidak cukup! Tersedia hanya ${product.available} akun.`);
      }

      const totalPrice = (product.price * amount) + 500;

      if (totalPrice < 500) {
        return msg.reply(`Minimal pembayaran QRISFAST adalah Rp 500. Total kamu saat ini: Rp ${totalPrice}`);
      }

      const reffId = generateRandomText(10);

      sendReaction(config.reactions.process);

      try {
        const response = await fetch(`${config.api.base_url}/deposit/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            reff_id: reffId,
            type: 'ewallet',
            metode: 'QRISFAST',
            nominal: totalPrice,
            api_key: config.api.secret_key
          })
        });

        const result = await response.json();

        const data = result.data;

        if (!data) return msg.reply(data.message);

        const text = `⬣ *Detail Pembayaran*\n\n` +
          `◉ Reff ID: ${data.reff_id}\n` +
          `◉ Harga Produk: ${toRupiah(totalPrice)}\n` +
          `◉ Harga Total (Termasuk PPN): ${toRupiah(data.nominal)}\n` +
          `◉ Jumlah Produk: ${amount} akun\n` +
          `◉ Produk: ${product.name}\n` +
          `◉ Dibuat: ${data.created_at}\n\n` +
          `*Note:* Pembayaran akan dibatalkan otomatis dalam 5 menit.`;
          
        const qrImage = await QRCode.toBuffer(data.qr_string);
          
        const sent = await client.sendMessage(jid, {
          image: qrImage,
          caption: text
        }, {
          quoted: msg
        });

        const msgId = sent.key.id;
        checkPaymentStatus(data.id, msgId);

        setTimeout(() => deleteMessage(msgId), 300000);

        async function checkPaymentStatus(payId, msgId) {
          const timeout = setTimeout(async () => {
            clearInterval(interval);
            await fetch(`${config.api.base_url}/deposit/cancel`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              body: new URLSearchParams({
                id: payId,
                api_key: config.api.secret_key
              })
            });
            sendReaction(config.reactions.failed);
            msg.reply(`⚠️ *Pembayaran dibatalkan otomatis* setelah 5 menit.`);
          }, 300000);

          const interval = setInterval(async () => {
            try {
              const response = await fetch(`${config.api.base_url}/deposit/status`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                  id: payId,
                  api_key: config.api.secret_key
                })
              });

              const result = await response.json();

              const data = result.data;

              if (data.status === 'success') {
                clearInterval(interval);
                clearTimeout(timeout);
                deleteMessage(msgId);
                sendReaction(config.reactions.success);

                msg.reply(`✅ *Pembayaran Berhasil!*\n\n` +
                  `◉ Produk: ${product.name}\n` +
                  `◉ Jumlah: ${amount} akun\n` +
                  `◉ Total: ${toRupiah(totalPrice)}\n` +
                  `◉ Status: ${data.status}\n` +
                  `◉ Waktu: ${data.created_at}`);

                product.available -= amount;
                product.sold += amount;
                writeJson(tmpFilePathProducts, products);

                const stocks = readJson(tmpFilePathStocks);
                const stockEntry = stocks.find(s => s[productCode]);

                if (!stockEntry || stockEntry[productCode].length < amount) {
                  msg.reply(`⚠️ Pembayaran berhasil, tapi stok tidak mencukupi.`);
                  return;
                }

                const stokDikirim = stockEntry[productCode].splice(0, amount);

                writeJson(tmpFilePathStocks, stocks);

                let stokMsg = `🎉 *Pembayaran Berhasil!*\n\n` +
                  `◉ Produk: ${product.name}\n` +
                  `◉ Jumlah: ${amount} akun\n` +
                  `◉ Total: ${toRupiah(totalPrice)}\n` +
                  `◉ Status: ${data.status}\n` +
                  `◉ Waktu: ${data.created_at}\n\n` +
                  `📦 *Berikut adalah detail akun kamu:*\n`;

                stokDikirim.forEach((akun, i) => {
                  //stokMsg += `\n${i + 1}. Username: ${akun.username}\n   Password: ${akun.password}\n   Email: ${akun.email}\n   Note: ${akun.note}`;
                  stokMsg += `\n${i + 1}. Email: ${akun.email}\n   Password: ${akun.password}\n   Note: ${akun.note}`;
                });

                msg.reply(stokMsg);

              } else if (['failed', 'canceled'].includes(data.status)) {
                clearInterval(interval);
                deleteMessage(msgId);
                sendReaction(config.reactions.failed);
                msg.reply('❌ Pembayaran gagal atau dibatalkan.');
              }

            } catch (error) {
              sendReaction(config.reactions.failed);
              msg.reply(`Error: ${error.message}`);
              console.error(error.response?.data || error);
            }
          }, 5000);
        }

      } catch (err) {
        sendReaction(config.reactions.failed);
        msg.reply(`Terjadi kesalahan: ${err.message}`);
        console.error(err);
      }

      break;
    }
    
    case 'get_stock':
    case 'ambil_stok': {
      if (!(isOwner || isMe)) return msg.reply('❌ Kamu tidak memiliki izin untuk menggunakan fitur ini.');
      const [productCode, amountStr] = parameters(',');
      const amount = parseInt(amountStr);

      if (!productCode || !amount || isNaN(amount) || amount < 1) {
        return msg.reply(`Contoh penggunaan: ${prefix}${command} one,1`);
      }

      try {
        sendReaction(config.reactions.process);

        const products = readJson(tmpFilePathProducts);
        const stocks = readJson(tmpFilePathStocks);

        const product = products.find(p => p.code === productCode);
        if (!product) {
          sendReaction(config.reactions.failed);
          return msg.reply(`Produk dengan kode "${productCode}" tidak ditemukan.`);
        }

        if (product.available < amount) {
          sendReaction(config.reactions.failed);
          return msg.reply(`Stok tidak cukup! Tersedia hanya ${product.available} akun.`);
        }

        const stockEntry = stocks.find(s => s[productCode]);

        if (!stockEntry || !Array.isArray(stockEntry[productCode]) || stockEntry[productCode].length < amount) {
          sendReaction(config.reactions.failed);
          return msg.reply(`Stok fisik untuk produk "${productCode}" tidak mencukupi.`);
        }

        const stokDikirim = stockEntry[productCode].splice(0, amount);

        product.available -= amount;
        product.sold = (product.sold || 0) + amount;

        writeJson(tmpFilePathProducts, products);
        writeJson(tmpFilePathStocks, stocks);

        let stokMsg = `🎉 *Berhasil Mengambil Stok* 🎉\n\n` +
          `◉ Produk: ${product.name} (${product.code})\n` +
          `◉ Jumlah: ${amount} akun\n\n` +
          `📦 *Detail akun:*\n`;

        stokDikirim.forEach((akun, i) => {
          //stokMsg += `\n${i + 1}. Username: ${akun.username || '-'}\n   Password: ${akun.password || '-'}\n   Email: ${akun.email || '-'}\n   Note: ${akun.note || '-' }\n`;
          stokMsg += `\n${i + 1}. Email: ${akun.email || '-'}\n   Password: ${akun.password || '-'}\n   Note: ${akun.note || '-' }\n`;
        });

        await client.sendMessage(jid, { text: stokMsg }, { quoted: msg });

        sendReaction(config.reactions.success);

        const refId = generateRandomText ? generateRandomText(8) : `${productCode}_${Date.now()}`;
        console.log(`[STOK-AMBIL] ref:${refId} user:${msg.sender || jid} product:${productCode} amount:${amount}`);

      } catch (err) {
        sendReaction(config.reactions.failed);
        msg.reply(`Terjadi kesalahan saat mengambil stok: ${err.message || err}`);
        console.error(err);
      }

      break;
    }

    case 'add_list': {
      if (!(isOwner || isMe)) return msg.reply('❌ Kamu tidak memiliki izin untuk menggunakan fitur ini.');

      const [cmd, text] = parameters('|');

      if (!cmd || !text) {
        return msg.reply(`Example: ${prefix}${command} produk1|Produk 1`);
      }

      addList(cmd, text);
      break;
    }

    case 'update_list': {
      if (!(isOwner || isMe)) return msg.reply('❌ Kamu tidak memiliki izin untuk menggunakan fitur ini.');

      const [cmd, text] = parameters('|');

      if (!cmd || !text) {
        return msg.reply(`Example: ${prefix}${command} produk1|Update Produk 1`);
      }

      updateList(cmd, text);
      break;
    }

    case 'remove_list':
    case 'delete_list': {
      if (!(isOwner || isMe)) return msg.reply('❌ Kamu tidak memiliki izin untuk menggunakan fitur ini.');

      const [cmd] = parameters();

      if (!cmd) {
        return msg.reply(`Example: ${prefix}${command} produk1`);
      }

      removeList(cmd);
      break;
    }

    case 'hapus_semua_list':
    case 'delete_all_lists': {
      if (!(isOwner || isMe)) return msg.reply('❌ Kamu tidak memiliki izin untuk menggunakan fitur ini.');

      const [confirm] = parameters(',');
      if (confirm !== 'confirm') {
        return msg.reply(`⚠️ PERINGATAN: Ini akan menghapus SEMUA data lists! 
    
Ketik: ${prefix}${command} confirm 
untuk mengonfirmasi penghapusan total.`);
      }

      writeJson(tmpFilePathLists, []);

      msg.reply('✅ Berhasil menghapus semua data lists.');
      break;
    }

    case 'daftar':
    case 'lis':
    case 'list':
    case 'lists': {
      const cmds = showAllCmds();
      if (cmds.length === 0) {
        return msg.reply('Belum ada list yang tersimpan.');
      }

      const listText = cmds.map(title => `- ${prefix}${title}`).join('\n');

      const formattedMessage = `*\`Hai ${senderName}\`*\n\n\`List Produk yang Tersedia\`\n\n${listText}`;

      return msg.reply(formattedMessage);
      break;
    }

    case 'hapus_cache':
    case 'delete_cache': {
      if (!(isOwner || isMe)) return msg.reply('❌ Kamu tidak memiliki izin untuk menggunakan fitur ini.');

      const [confirm] = parameters(',');
      if (confirm !== 'confirm') {
        return msg.reply(`⚠️ PERINGATAN: Ini akan menghapus cache produk! 
    
Ketik: ${prefix}${command} confirm 
untuk mengonfirmasi penghapusan.`);
      }

      writeJson(PRODUCTS_DATA_PATH, []);

      msg.reply('✅ Berhasil menghapus cache produk.');
      break;
    }

    case 'hapus_data':
    case 'delete_data': {
      if (!(isOwner || isMe)) return msg.reply('❌ Kamu tidak memiliki izin untuk menggunakan fitur ini.');

      const [confirm] = parameters(',');
      if (confirm !== 'confirm') {
        return msg.reply(`⚠️ PERINGATAN: Ini akan menghapus SEMUA data termasuk produk, stok, orders, dan lists! 
    
Ketik: ${prefix}${command} confirm 
untuk mengonfirmasi penghapusan total.`);
      }

      writeJson(PRODUCTS_DATA_PATH, {});
      writeJson(tmpFilePathOrders, {});
      writeJson(tmpFilePathLists, {});
      writeJson(tmpFilePathProducts, []);
      writeJson(tmpFilePathStocks, []);

      msg.reply('✅ Berhasil menghapus semua data sistem.');
      break;
    }

    default: {
      async function initializeProductsData() {
        console.log('Loading data produk...');
        const data = loadProductsData();
        if (data) {
          cachedProductsData = data;
          lastFetchTime = Date.now();
          console.log('Data produk berhasil di-load dari file');
        } else {
          await getProductsData();
        }
      }

      initializeProductsData();

      if (!prefix) return;
      msg.reply(`Perintah tidak dikenali. Ketik *${prefix}menu* untuk melihat daftar perintah.`);
    }
  }
};