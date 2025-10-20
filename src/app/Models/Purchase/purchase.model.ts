export interface Purchase {
    buyers_i_information_id?: number | null,
    mp_i_lot_id?: number | null,
    payment_type?: string,
    terms?: number | null,
    e_signature?: string,
    beneficiary1?: string,
    beneficiary2?: string,
    datePayment?: number | null,
    created_by?: number | null,
}