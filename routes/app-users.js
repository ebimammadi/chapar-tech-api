const express = require("express")
const router = express.Router()

const { auth, adminAuth } = require("../middleware/auth")

const authFunction = require("./app-users/auth")
const profileFunction = require("./app-users/profile")
const usersFunction = require("./app-users/users")

//authRoutes
//router.get('/me', async (req,res) => await authFunction.me(req, res))
router.post('/register', async (req,res) => await authFunction.register(req, res))
router.post('/login', async (req, res) => await authFunction.login(req, res))
router.post('/recover-password', async (req, res) => await authFunction.recoverPassword(req, res))
router.post('/forget-password', async (req,res) => await authFunction.forgetPassword(req, res))
router.get('/recover-password-verify-code/:code', async (req,res) => await authFunction.recoverPasswordVerifyCode(req, res))
router.get('/verify-email/:code', async (req,res) => await authFunction.verifyEmail(req, res))
router.get('/logout', async (req,res) => await authFunction.logout(req, res))

//profileRoutes
router.get('/profile-get', auth, async (req, res) => await profileFunction.profileGet(req, res))
router.post('/profile-set', auth, async (req, res) => await profileFunction.profileSet(req, res))
router.post('/email-set', auth, async (req, res) => await profileFunction.emailSet(req, res))
router.post('/mobile-set', auth, async (req, res) => await profileFunction.mobileSet(req, res))
router.post('/password-set', auth, async (req, res) => await profileFunction.passwordSet(req, res))
router.get('/send-verification-link', auth, async (req, res) => await profileFunction.sendVerificationLink(req, res))
router.post('/send-verification-sms', auth, async (req, res) => await profileFunction.sendVerificationSms(req, res))
router.post('/receive-verification-sms', auth, async (req, res) => await profileFunction.receiveVerificationCode(req, res))
router.post('/send-request-supplier', auth, async (req, res) => await profileFunction.sendRequestSupplier(req, res))

//userRoutes 
router.get('/user-list', auth, adminAuth, async (req, res) => await usersFunction.userList(req, res))
router.get('/profile-get-by-email/:email', auth, adminAuth, async (req, res) => await usersFunction.profileGetByEmail( req, res))
router.post('/user-activate', auth, adminAuth, async (req, res) => await usersFunction.userActivate(req, res))
router.post('/user-suspend', auth, adminAuth, async (req, res) => await usersFunction.userSuspend(req, res))
router.post('/user-set-role', auth, adminAuth, async (req, res) => await usersFunction.userSetRole(req, res))

module.exports = router
