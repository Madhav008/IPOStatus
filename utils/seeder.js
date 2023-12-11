
const importData = async () => {

    try {

        const createdUsers = new users({

            name: 'Admin User',
            email: 'admin@example.com',
            password: bcrypt.hashSync('123456', 10),
            isAdmin: true,
        }
        )
        await createdUsers.save()
        process.exit()
    } catch (error) {
        console.error(`${error}`)
        process.exit(1)
    }
}



importData()