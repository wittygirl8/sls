export const youlendBankUpdateEmailTemplate = (merchantId) => {
    return `
    <table style="width: 100%; min-width: 320px; max-width: 600px;">
	<tr>
		<td>
			<div style="
                        background-position: center; 
                        background-repeat: no-repeat;
                        background-size: cover;
                        position: relative;
                ">
				<img style="
                            border-top-left-radius: 10px;
                            border-top-right-radius: 10px;
                            width: 100%;
                            max-width: 100%;
                            height: 170px;" src="https://email-template-general-images.s3.eu-west-1.amazonaws.com/email-template-images/bank_update_request_approved.png
                    ">
				</div>
				<div class="productDetails">
					<p>
						<strong>Dear Team Youlend,</strong>
					</p>
					<p>The merchant ${merchantId} has updated their Banking details with Datman to the banking details provided by Youlend.</p>
				</div>
				<div class="productDetails">
					<p>
						Regards,
						<br/>
						Datman Team.
					
					</p>
				</div>
			</td>
		</tr>
	</table>
`;
};
