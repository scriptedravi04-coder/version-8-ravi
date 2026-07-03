import axios from "axios";

async function test() {
  try {
    const res = await axios.get('http://localhost:3000/api/auth/me', {
      headers: {
        'Authorization': 'Bearer dev_bypass'
      }
    });
    console.log(res.data);
  } catch (e) {
    console.error(e.message);
  }
}
test();
