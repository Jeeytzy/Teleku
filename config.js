module.exports = {
  pairing_mode: true,
  prefix: ['/', '!', '#', '.'], // If you don't want to use a prefix, delete the string value. Supports symbols: /, #, !, ?, ., and ,.
  chat_mode: 'default', // default/self/private/group.
  connection_status_message: false,
  only_show_command_chat: false,
  group_member_status_message: true,
  bot_offline_status: false,
  automatic_read_messages: true,
  automatic_update_profile_status: [false, "Status"],
  automatic_typing_or_recording: [true, "typing"], // mengetik/merekam.
  owner_number: '',
  owner_name: 'Jeeyhosting⚡',
  bot_name: 'DigitalBot',
  api: {
    base_url: 'https://atlantich2h.com', // Do not change this URL.
    secret_key: 'isi_api_lu', // isi dengan api payment gateway  Atlantic Pedia.
    profit: 1, // Nilai ini akan dibagi 100 dan dibagi sesuai harga produk.
    transaction_limit: true,
    wd_balance: {
      bank_code: 'Dana',
      destination_number: '083834186945'
    }
  },
  reactions: {
    process: '👀',
    success: '✓',
    failed: '❌'
  }
};