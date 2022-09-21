const express = require('express');
const router = express.Router();
const User = require('../models/user');
const patientModel = require('../models/patient');
const fs = require("fs");

const mongoose = require('mongoose');

const MongoDBURI = process.env.MONGO_URI || 'mongodb://localhost/ManualAuth';

mongoose.connect(MongoDBURI, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
});

router.get('/', (req, res, next) => {
	return res.render('index.ejs');
});

const arrayPatients = [];

const multer = require('multer');

// cria uma instância do middleware configurada
const upload = multer({ dest: 'uploads/' });

router.get('/addFiles', (req, res, next) => {
	return res.render('addfiles.ejs');
});

// rota indicado no atributo action do formulário
router.post('/addFilesForms', upload.single('file'), (req, res, next) => {
  res.send('<h2>Upload realizado com sucesso</h2>')
});

router.post('/addFilesForms', (req, res, next) => {
  const formidable = require('formidable');
  const fs = require('fs');
  const form = new formidable.IncomingForm();

  form.parse(req, (err, fields, files) => {

    const path = require('path');
    const oldpath = files.filetoupload.path;
    const newpath = path.join(__dirname, '..', files.filetoupload.name);

    fs.renameSync(oldpath, newpath);
    res.send('File uploaded and moved!');
  });
});

router.post('/', (req, res, next) => {
	let personInfo = req.body;

	if (!personInfo.email || !personInfo.username || !personInfo.password || !personInfo.passwordConf) {
		res.send();
	} else {
		if (personInfo.password == personInfo.passwordConf) {

			User.findOne({ email: personInfo.email }, (err, data) => {
				if (!data) {
					let c;
					User.findOne({}, (err, data) => {

						if (data) {
							c = data.unique_id + 1;
						} else {
							c = 1;
						}

						let newPerson = new User({
							unique_id: c,
							email: personInfo.email,
							username: personInfo.username,
							password: personInfo.password,
							passwordConf: personInfo.passwordConf
						});

						newPerson.save((err, Person) => {
							if (err)
								console.log(err);
							else
								console.log('Success');
						});

					}).sort({ _id: -1 }).limit(1);
					res.send({ "Success": "You are registered, You can login now." });
				} else {
					res.send({ "Success": "Email is already used" });
				}

			});
		} else {
			res.send({ "Success": "Password is not matched" });
		}
	}
});

router.get('/login', (req, res, next) => {
	return res.render('login.ejs');
});

router.get('/settings', (req, res, next) => {
	return res.render('settings.ejs');
});

router.post('/login', (req, res, next) => {
	User.findOne({ email: req.body.email }, (err, data) => {
		if (data) {

			if (data.password == req.body.password) {
				req.session.userId = data.unique_id;
				res.send({ "Success": "Success!" });
			} else {
				res.send({ "Success": "Wrong password!" });
			}
		} else {
			res.send({ "Success": "This Email Is not regestered!" });
		}
	});
});

router.get('/profile', (req, res, next) => {
	User.findOne({ unique_id: req.session.userId }, (err, data) => {
		if (!data) {
			res.redirect('/');
		} else {
			return res.render('data.ejs', { "name": data.username, "email": data.email });
		}
	});
});

router.get('/logout', (req, res, next) => {
	if (req.session) {
		// delete session object
		req.session.destroy((err) => {
			if (err) {
				return next(err);
			} else {
				return res.redirect('/');
			}
		});
	}
});

router.get("/patients", (req, res, next) => {
  return res.render("patients.ejs");
})

router.get("/history", (req, res, next) => {
	db.collection('patients').find({}).toArray(function(err, docs) {
		return res.render("history.ejs", {patients: docs});
	});
});

router.get("/patients", async (request, response) => {
  const patientsDb = await patientModel.find({});

  try {
    response.send(patientsDb);
  } catch (error) {
    response.status(500).send(error);
  }
});

router.post("/patients", async (req, res) => {
	// let patientInfo = req.body;
	const patientDb = new patientModel(req.body);

	try {
		await patientDb.save();


		// let resul = {
		// 	firstName: patientInfo.firstName,
	  //   lastName: patientInfo.lastName,
		// 	tel: patientInfo.tel,
		// 	dateBirth: patientInfo.dateBirth,
		// 	momName: patientInfo.momName,
		// 	dadName: patientInfo.dadName,
		// 	address: patientInfo.address,
		// 	city: patientInfo.city,
		// 	genre: patientInfo.genre,
		// 	civilState: patientInfo.civilState,
		// 	beloved: patientInfo.beloved,
		// 	diagnose: patientInfo.diagnose,
		// 	cid: patientInfo.cid,
		// 	intDate: patientInfo.intDate,
		// 	crm: patientInfo.crm,
		// 	phyData: patientInfo.phyData,
		// 	cardName: patientInfo.cardName,
		// 	oxiName: patientInfo.oxiName,
		// 	tempName: patientInfo.tempName,
		// 	coagName: patientInfo.coagName,
		// 	pressName: patientInfo.pressName,
		// 	weight: patientInfo.weight,
		// 	height: patientInfo.height,
		// 	generalState: patientInfo.generalState,
		// 	procedures: patientInfo.procedures,
		// 	princDiagnose: patientInfo.princDiagnose,
		// 	exams: patientInfo.exams,
		// 	statePatient: patientInfo.statePatient,
		// 	leavePatient: patientInfo.leavePatient,
		// 	obsExtra: patientInfo.obsExtra,
		// };
		await res.redirect("/history");
	} catch (error) {
		res.status(500).send(error);
	}
})

router.get('/forgetpass', (req, res, next) => {
	res.render("forget.ejs");
});

router.post('/forgetpass', (req, res, next) => {
	User.findOne({ email: req.body.email }, (err, data) => {
		if (!data) {
			res.send({ "Success": "This Email Is not regestered!" });
		} else {
			if (req.body.password == req.body.passwordConf) {
				data.password = req.body.password;
				data.passwordConf = req.body.passwordConf;

				data.save((err, Person) => {
					if (err)
						console.log(err);
					else
						console.log('Success');
					res.send({ "Success": "Password changed!" });
				});
			} else {
				res.send({ "Success": "Password does not matched! Both Password should be same." });
			}
		}
	});

});

module.exports = router;
