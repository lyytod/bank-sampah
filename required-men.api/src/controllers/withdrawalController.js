const WithdrawalModel = require('../models/withdrawalModel');
const UserModel = require('../models/userModel');
const db = require('../config/db');

const WithdrawalController = {
  // POST /api/withdrawals
  async requestWithdrawal(req, res) {
    try {
      const { amount, bank_name, account_number } = req.body;
      const user_id = req.user.id;

      if (!amount || !bank_name || !account_number) {
        return res.status(400).json({
          success: false,
          message: 'Nominal, nama bank, dan nomor rekening wajib diisi',
          data: null
        });
      }

      const withdrawAmount = parseFloat(amount);
      if (withdrawAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Nominal penarikan tidak valid',
          data: null
        });
      }

      // Ambil minimum penarikan dari system_settings
      const [settings] = await db.execute(`SELECT setting_value FROM system_settings WHERE setting_key = 'MIN_WITHDRAWAL_BALANCE'`);
      const minWithdraw = settings.length > 0 ? parseFloat(settings[0].setting_value) : 50000;

      if (withdrawAmount < minWithdraw) {
        return res.status(400).json({
          success: false,
          message: `Minimal penarikan adalah Rp ${minWithdraw.toLocaleString('id-ID')}`,
          data: null
        });
      }

      // Validasi Saldo (Saldo Aktif - Penarikan Pending)
      const user = await UserModel.findById(user_id);
      const pendingTotal = await WithdrawalModel.getPendingWithdrawalTotal(user_id);
      
      const availableBalance = user.balance - pendingTotal;

      if (withdrawAmount > availableBalance) {
        return res.status(400).json({
          success: false,
          message: `Saldo tidak mencukupi. Saldo tersedia Anda saat ini adalah Rp ${availableBalance.toLocaleString('id-ID')} (setelah dikurangi penarikan pending).`,
          data: null
        });
      }

      // Create Request
      const result = await WithdrawalModel.create({
        user_id,
        amount: withdrawAmount,
        bank_name,
        account_number
      });

      return res.status(201).json({
        success: true,
        message: 'Permintaan penarikan berhasil dikirim. Menunggu proses admin.',
        data: { id: result.insertId }
      });

    } catch (error) {
      console.error('Request Withdrawal Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
        data: null
      });
    }
  },

  // GET /api/withdrawals/my
  async getMyWithdrawals(req, res) {
    try {
      const user_id = req.user.id;
      const withdrawals = await WithdrawalModel.findByUserId(user_id);
      
      return res.status(200).json({
        success: true,
        message: 'Berhasil mengambil riwayat penarikan',
        data: withdrawals
      });
    } catch (error) {
      console.error('Get My Withdrawals Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
        data: null
      });
    }
  },

  // GET /api/withdrawals (Admin)
  async getAllWithdrawals(req, res) {
    try {
      const withdrawals = await WithdrawalModel.findAll();
      return res.status(200).json({
        success: true,
        message: 'Berhasil mengambil semua penarikan',
        data: withdrawals
      });
    } catch (error) {
      console.error('Get All Withdrawals Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
        data: null
      });
    }
  },

  // PATCH /api/withdrawals/:id/status (Admin)
  async updateWithdrawalStatus(req, res) {
    try {
      const { status } = req.body;
      const { id } = req.params;

      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status tidak valid. Gunakan "approved" atau "rejected".',
          data: null
        });
      }

      await WithdrawalModel.updateStatus(id, status);

      return res.status(200).json({
        success: true,
        message: `Penarikan berhasil di-${status}`,
        data: null
      });
    } catch (error) {
      console.error('Update Withdrawal Status Error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Gagal mengubah status penarikan',
        data: null
      });
    }
  }
};

module.exports = WithdrawalController;
