require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { connectHccSmsDB, getHccSmsDB } = require('../config/db');
const bcrypt = require('bcrypt');

async function migrateStudentPasswords() {
    try {
        // Connect to MongoDB
        await connectHccSmsDB();
        const Student = require('../models/student');

        console.log('Connected to MongoDB');

        // Find students without passwords
        const studentsWithoutPasswords = await Student.find({
            $or: [
                { password: { $exists: false } },
                { password: null },
                { password: '' }
            ],
            phoneNumber: { $exists: true, $ne: null, $ne: '' }
        });

        console.log(`Found ${studentsWithoutPasswords.length} students without passwords`);

        let updatedCount = 0;
        let errorCount = 0;

        // Update each student
        for (const student of studentsWithoutPasswords) {
            try {
                if (student.phoneNumber) {
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(student.phoneNumber, salt);
                    
                    student.password = hashedPassword;
                    await student.save();
                    
                    updatedCount++;
                    console.log(`Updated password for: ${student.firstName} ${student.lastName} (${student.admissionNumber})`);
                }
            } catch (error) {
                errorCount++;
                console.error(`Error updating student ${student.admissionNumber}:`, error.message);
            }
        }

        console.log('\nMigration completed!');
        console.log(`Successfully updated: ${updatedCount} students`);
        console.log(`Errors encountered: ${errorCount} students`);
        
        await getHccSmsDB().close();
        process.exit(0);

    } catch (error) {
        console.error('Migration failed:', error);
        try { await getHccSmsDB().close(); } catch { /* Connection may not have opened. */ }
        process.exit(1);
    }
}

// Run the migration
migrateStudentPasswords();