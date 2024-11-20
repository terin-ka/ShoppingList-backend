// standardizovaný tvar odpovědi API
// message - textová zpráva pro případný toast box
// data - data, která se mají vrátit
// použití při volání na backendu getResponse("Zpráva", data);
// na klientovi při status code 2xx vyzvedneme předaná data
// response.data.message nebo např. response.data.data.render_id
// při status code non 2xx vyvolá axios výjimku a pak čteme
// error.response.data.message

export function getResponse(message, data = null) {
  return { message: message, data: data };
}
