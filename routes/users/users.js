const _ = require("lodash")
const jwt = require("jsonwebtoken")
const { User, validateUser } = require("../../models/user")
const { regex } = require("../../components/lib")
const { invalidateSessions } = require("../../middleware/session")
const mailer = require("../../components/nodemailer")
const userList = async (req, res) => {
  // req.body: search, page, userRole
  const { error } = validateUser.userList(req.query)
	if (error) return res.json({ message: error.details[0].message })
  const perPage = parseInt(process.env.PER_PAGE)
  const page = parseInt(req.query.page) || 1
  const skip = (page-1) * perPage
  const userRole = regex(req.query.userRole || '')
  const search = regex(req.query.search || '')
  const findOptions = {
    $and: [ { $or: [ { name: search }, { email: search } ] }, { userRole: userRole } ],
  }
  const result = await User.aggregate([
    { $sort: {date: -1} },
    { $match: findOptions },
    { $facet: {
        "stage1" : [ { "$group": { _id: null, count: { $sum: 1 } } } ],
        "stage2" : [ { "$skip": skip }, {"$limit": perPage } ]
      }
    },
    { $unwind: "$stage1" },
    { $project: {
        count: "$stage1.count",
        data: "$stage2"
      }
    }
  ])
  if (result.length == 0) return res.json( { count: 0, users: [], perPage } )
  const users = result[0].data
    .map ( user => _.omit( user, [ "password", "passwordRecoverCode", "__v", "emailVerifyCode", "mobileVerifyCode"]) )
  return res.json( { count: result[0].count, users, perPage } )
}
const profileGetByEmail = async (req, res) => {
  //params: email
  const { error } = validateUser.emailValidate(req.params)
	if (error) return res.json({ message: error.details[0].message })
  const user = await User.findOne( { email: req.params.email } )
    .select('-password -passwordRecoverCode -__v -emailVerifyCode -mobileVerifyCode')
	if (!user) return res.json({ message: `Error! Invalid 'email: ${req.params.email}'.` })
	const profile = user //_.omit( user, ["password", "passwordRecoverCode", "__v"])
	if (profile.urls.facebook === undefined) profile.urls = { facebook: '', instagram: '', website: '' }
	return res.send( profile )
}
//userActivateSuspend (action: suspend, activate)
const userActivateSuspend = async (req, res, action) => {
  const { error } = validateUser.idValidate(req.body)
	if (error) return res.json({ message: error.details[0].message })
	const _id = req.body._id
	const token = jwt.verify(req.cookies["x-auth-token"], process.env.JWT_KEY)
	if (token._id === _id )
		return res.json({ message: `You are not allowed to change your own access!`})
	const user = await User.findById( _id )
	if (!user) return res.json({ message: `Error! Invalid '_id'.` })
  user.isActive = !user.isActive
  await user.save()
  if (action == 'suspend') await invalidateSessions(_id, 'suspended')
  const text = (action == 'activate') ? 'activated' : 'suspended' 
  return res.send({ response_type: 'success', message: `User ${user.name} 
    (${user.email}) has been ${text} successfully.`, _id })
}
const userActivate = async (req, res) => {
  //payload: _id
  return await userActivateSuspend(req, res, 'activate')
}
const userSuspend = async (req, res) => {
  //payload: _id
  return await userActivateSuspend(req, res, 'suspend')
}

const userSetRole = async (req, res) => {
  //payload (_id, userRole)
  const { error } = validateUser.userRole(req.body)
	if (error) return res.json({ message: error.details[0].message })
	const _id = req.body._id
	const user = await User.findById( _id )
	if (!user) return res.json({ message: `Error! Invalid '_id'.` })
  if (user.userRole === req.body.userRole ) 
    return res.send({ message: `User ${user.name} (${user.email}) is already a(n) ${user.userRole}!.`, _id })
  user.userRole = req.body.userRole
  const previous = user.setRoleStatusPrevious()
  user.roleStatus = { status: 'pending', previous }
  await user.save()
  await mailer(user.email, `'${user.userRole}' Access granted at ${process.env.APP_NAME}`, user, 'roleGrantedTemplate')
  return res.send({ response_type: 'success', message: `User ${user.name} 
    (${user.email}) has been set as a(n) ${user.userRole}.`, _id })
}

module.exports = {
  userList,
  profileGetByEmail,
  userActivate,
  userSuspend,
  userSetRole
}