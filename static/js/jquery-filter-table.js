$(document).ready(function() {

  // DO GET
  $.ajax({
      type: "GET",
      url: "./views/history.ejs"
      success: let i = 0;
      patients.forEach(function(patient) {
        i++;
        var patientRow = '<tr>' +
          '<td>' + patient.firstName + '</td>' +
          '<td>' + patient.lastName + '</td>' +
          '<td>' + patient.phyData + '</td>' +
          '<td>' + patient.cardName + '</td>' +
          '<td>' + patient.oxiName + '</td>' +
          '<td>' + patient.tempName + '</td>' +
          '<td>' + patient.coagName + '</td>' +
          '<td>' + patient.pressName + '</td>' +
          '<td>' + patient.weight + '</td>' +
          '<td>' + patient.height + '</td>' +
          '<td>' + patient.princDiagnose + '</td>' +
          '<td>' + patient.exams + '</td>' +
          '</tr>';

        $('#patientTable tbody').append(patientRow);

      });

      $("#patientTable tbody tr:odd").addClass("info");
      $("#patientTable tbody tr:even").addClass("success");
			//$("#patientTable tbody tr").addClass("success");
    },
    error: function(e) {
      alert("ERROR: ", e);
      console.log("ERROR: ", e);
    }
  });

// do Filter on View
$("#inputFilter").on("keyup", function() {
  var inputValue = $(this).val().toLowerCase();
  $("#patientTable tr").filter(function() {
    $(this).toggle($(this).text().toLowerCase().indexOf(inputValue) > -1)
  });
});
})
