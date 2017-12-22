import {Uran} from "../core/Uran"


const app = new Uran('#root');


app.use(async (req, res, next) => {
    try {
        await next();
    } catch (e) {
        console.log(e)
    }
});

