var mongoose        = require('mongoose');
var Schema          = mongoose.Schema;

var productSchema    = new Schema({
    name : {        type: String,
                    validate: { validator: function(v){
                        return Boolean(v);},   
                    message: "Name required."}
           },
    description : String,
    unitPrice : {   type: Number,
                    min: 0    
                },
    unitCost : {    type: Number,
                    min : 0
               },
    quantity: {     type: Number,
                    min: 0                
              },
    category: {     type: String,
                    enum: ['Food', 'Toys', 'Grooming', 'Bedding']
              }
});

module.exports = mongoose.model('product', productSchema); 