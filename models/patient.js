const mongoose = require('mongoose');
const PatientSchema = mongoose.Schema;

patientSchema = new PatientSchema( {
  firstName: String,
  lastName: String,
  phyData: String,
  cardName: String,
  oxiName: String,
  tempName: String,
  coagName: String,
  pressName: String,
  weight: String,
  height: String,
	createdAt: {
		type: Date,
		default: Date.now
	}
}),
Patient = mongoose.model('Patient', patientSchema);

console.log(Patient);

module.exports = Patient;
