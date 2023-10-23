import puppeteer from "puppeteer";



export async function aseo_sertex(municipality,rol, dv) {
  // measurement_date info
  const fechaActual = new Date();

  const dia = fechaActual.getDate();
  const mes = fechaActual.getMonth() + 1;
  const año = fechaActual.getFullYear();
  const hora = fechaActual.getHours();
  const minutos = fechaActual.getMinutes();
  const segundos = fechaActual.getSeconds();

  const fechaFormateada = `${año}-${mes}-${dia} ${hora}:${minutos}:${segundos}`;

  // Puppeteer
  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: { width: 1280, height: 720 },
  });

  const page = await browser.newPage();

  try {
    try {
      await page.goto(`https://sertex3.stonline.cl/${municipality}/Aseo/asp/asignarut.asp?MZN=${rol}&PDO=${dv}`,{ timeout: 5000 });
    } catch {
      return {
        data: [
          {
            id: rol + "-" + dv,
            measurement_date: fechaFormateada,
            invoice_amount: "Sin deuda/No registrado",
          },
        ],
      };
    }
    await page.waitForSelector(
      "body > div > div.container.border > div > form > table:nth-child(4) > tbody > tr:nth-child(5) > td:nth-child(2) > strong > font",
      { timeout: 5000 }
    );

    const result = await page.evaluate(() => {
      const cant = document.querySelectorAll("b");
      const texts = [];

      cant.forEach((can) => {
        texts.push(can.innerText);
      });
      return texts;
    });

    let total = result[result.length - 1];
    total = total
      .substring(total.indexOf("$") + 2, total.length)
      .replace(".", "");
    total = parseInt(total);
    await browser.close();
    if (total > 0) {
      return {
        data: [
          {
            id: rol + "-" + dv,
            measurement_date: fechaFormateada,
            invoice_amount: total,
          },
        ],
      };
    } else {
      return {
        data: [
          {
            id: rol + "-" + dv,
            measurement_date: fechaFormateada,
            invoice_amount: "Sin deuda/No registrado",
          },
        ],
      };
    }
  } catch {
    return {
      data: [
        {
          invoice_amount: 'Error al cargar página',
        },
      ],
    };
  }
}


export default aseo_sertex