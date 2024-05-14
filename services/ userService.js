const secretKey = process.env.SECRET_KEY;
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const usersFilePath = path.join(__dirname, '../data/users.json');

const readUsersFile = () => {
	const data = fs.readFileSync(usersFilePath);
	return JSON.parse(data);
};

const writeUsersFile = (data) => {
	fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 2));
};

const signup = (req, res) => {
	const { username, firstName, lastName, password, paymentMethod, address, profilePicture } = req.body;
	const users = readUsersFile();

	if (users.some((user) => user.username === username)) {
		return res.status(400).json({ message: 'Username already exists' });
	}

	const hashedPassword = bcrypt.hashSync(password, 8);
	const newUser = {
		id: uuidv4(),
		username,
		firstName,
		lastName,
		password: hashedPassword,
		paymentMethod,
		address,
		profilePicture: profilePicture || 'https://cdn.pixabay.com/photo/2017/02/23/13/05/avatar-2092113_1280.png',
	};

	users.push(newUser);
	writeUsersFile(users);

	res.status(201).json({ message: 'User created successfully' });
};

const login = (req, res) => {
	const { username, password } = req.body;
	const users = readUsersFile();

	const user = users.find((u) => u.username === username);
	if (!user) {
		return res.status(400).json({ message: 'Invalid username or password' });
	}

	const passwordIsValid = bcrypt.compareSync(password, user.password);
	if (!passwordIsValid) {
		return res.status(400).json({ message: 'Invalid username or password' });
	}

	const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: '10h' });
	res.json({ message: 'Login successful', token });
};

const getAllUsers = (req, res) => {
	const users = readUsersFile();
	res.json(users);
};

const updateUser = (req, res) => {
	const { id } = req.params;
	const { firstName, lastName, address } = req.body;
	const users = readUsersFile();

	const userIndex = users.findIndex((u) => u.id === id);
	if (userIndex === -1) {
		return res.status(404).json({ message: 'User not found' });
	}

	users[userIndex].firstName = firstName;
	users[userIndex].lastName = lastName;
	users[userIndex].address = address;

	writeUsersFile(users);
	res.json({ message: 'User updated successfully' });
};

module.exports = {
	signup,
	login,
	getAllUsers,
	updateUser,
};
