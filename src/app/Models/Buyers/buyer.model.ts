export interface Buyer {
    buyers_i_information_id? : number,
    buyers_name: string,
    contact_number: string,
    province?: string,
    municipality?: string,
    barangay?: string,
    zipcode?: number,
    otp: string,
}
