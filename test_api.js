import axios from "axios";

async function test() {
  try {
    const res = await axios.post("http://localhost:3000/api/ai/negotiation", {
      history: [],
      offer: "1000",
      brandContext: {},
      creatorContext: {}
    });
    console.log(res.data);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
test();
