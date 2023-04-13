import Axios from "axios";

const ADDRESS_IO_API_KEY = process.env.ADDRESS_IO_API_KEY;

export class AddressService {
    async findByPostCode(postCode) {
        return Axios.get(
            `https://api.getAddress.io/find/${postCode}?api-key=${ADDRESS_IO_API_KEY}&expand=true&sort=true`
        );
    }
}