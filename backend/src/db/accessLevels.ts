import * as mongoose from 'mongoose'


const accessLevelsSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        unique: true,
        enum: ['Admin', 'Manager', 'Supporter'] 
    },
    methods: [
        {
            name: {
                type: String,
                required: true
            },
            per_name: {
                type: String,
                required: true
            }
        }
    ]
})

export const AccessLevels = mongoose.model('AccessLevels', accessLevelsSchema)
