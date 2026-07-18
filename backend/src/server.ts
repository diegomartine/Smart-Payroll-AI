import app from "./app";

import { env } from "./config/env";

app.listen(env.PORT, () => {
    console.log(`🚀 Smart Payroll AI ejecutándose en el puerto ${env.PORT}`);
});