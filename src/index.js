const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
/*app.use(cors({
    origin: process.env.CLIENT_PORT_URL
})); */
app.use(cors());

/*Habilitar express.json*/
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));


// Mi objeto JSON
const data = {
    "personas": [
        {
            "nombre": 'LUIS',
            "apellido": 'GONZALEZ',
            "cedula": 'V-25444333',
            "correo": 'ejemplo01@gmail.com',
        },
        {
            "nombre": 'FERNANDO',
            "apellido": 'JIMENEZ',
            "cedula": 'V-26444333',
            "correo": 'ejemplo02@gmail.com',
        },
    ],
    "usuarios": [
        {
            "userName": 'usuario01',
            "password": 123456789,
            "cedula_persona": 'V-25444333',
        },
        {
            "userName": 'usuario02',
            "password": 123456789,
            "cedula_persona": 'V-26444333',
        }
    ],
};

// Escribir el objeto JSON en un archivo
fs.writeFile('db.json', JSON.stringify(data), 'utf8', (err) => {
    if (err) throw err;
    console.log('El archivo JSON ha sido creado exitosamente');
});

// fs.readFile('db.json', 'utf8', (err, jsonString) => {
//     if (err) throw err;
//     const json = JSON.parse(jsonString);
//     console.log(json);
//     console.log(json[0].userName);

// });

//   Editar el archivo JSON
// fs.readFile('ejemplo.json', 'utf8', (err, jsonString) => {
//     if (err) throw err;
//     const json = JSON.parse(jsonString);
//     json.age = 31; // Cambiar la edad
//     // Escribir los cambios de vuelta al archivo
//     fs.writeFile('ejemplo.json', JSON.stringify(json), 'utf8', (err) => {
//       if (err) throw err;
//       console.log('El archivo JSON ha sido editado exitosamente');
//     });
//   });

/*Rutas*/
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');


app.post('/login',
    [
        check('userName', 'El nombre de usuario debe ser minimo de 4 caracteres').isLength({ min: 4 }),
        check('password', 'El password debe ser minimo de 8 caracteres').isLength({ min: 8 })
    ],
    async (req, res) => {

        const { userName, password } = req.body;

        /*revisar si hay errores*/
        const errores = validationResult(req);

        if (!errores.isEmpty()) {
            return res.status(400).json({ errores: errores.array() })
        }

        return fs.readFile('db.json', 'utf8', async (err, jsonString) => {

            if (err) throw err;

            const loginJSON = JSON.parse(jsonString);
            let datos = 1;

            for await (const iterator01 of loginJSON.usuarios) {
                if (iterator01.userName === userName && iterator01.password === password) {
                    datos = iterator01;
                }
            }

            for await (const iterator02 of loginJSON.personas) {
                if (iterator02.cedula === datos.cedula_persona) {
                    datos = Object.assign(datos, iterator02);
                }
            }

            if (datos !== 1) {

                /*si todo es correcto crear y firmar el jwt*/
                const payload = {
                    user: {
                        cedula: datos.cedula,
                    }
                };

                /*firmar el jwt*/
                jwt.sign(payload, "CodigoLuis00", {
                    /* expires in 24 hours*/
                    expiresIn: 60 * 60 * 24,
                },
                    (error, token) => {
                        if (error) throw error;

                        /*mensaje de confirmacion*/
                        res.json({
                            token,
                            userName: datos.userName,
                            firstname: datos.nombre,
                            surname: datos.apellido,
                        });

                    });
            }
            else {
                return res.status(400).json({ "message": "Datos erróneos" });
            }

        });
        
    }
);







/*puerto de la app*/
const PORT = 3210;

/*arracando servidor*/
app.listen(PORT, () => {
    console.log(`=>El servidor esta arrancado en el puerto ${PORT}`);
}); 