def batch_update_all_items(table_name, new_aggregates):

    table = dynamodb.Table(table_name)
    client = boto3.client('dynamodb')

    try:
        # Step 1: Retrieve all items from the table
        response = table.scan()
        items = response.get('Items', [])

        # Convert the new aggregates list to a dictionary for easier lookups
        aggregates_dict = {agg["bankId"]: agg for agg in new_aggregates}

        # Step 2: Process and prepare updated items for batch write
        updates = []
        for item in items:
            bank_id = int(item['bankId'])
            current_sent = float(item.get('sentPayments', 0))
            current_received = float(item.get('receivedPayments', 0))

            # Check if the current bankId has new aggregate values
            if bank_id in aggregates_dict:
                new_values = aggregates_dict[bank_id]
                new_sent = current_sent + new_values['paymentSent']
                new_received = current_received + new_values['paymentReceived']

                # Prepare the updated item for BatchWriteItem
                updates.append({
                    'PutRequest': {
                        'Item': {
                            'bankId': {'N': str(bank_id)},
                            'sentPayments': {'N': str(new_sent)},
                            'receivedPayments': {'N': str(new_received)}
                        }
                    }
                })

        # Step 3: Batch write the updated items
        # DynamoDB allows a maximum of 25 items per BatchWriteItem request
        for i in range(0, len(updates), 25):
            batch = updates[i:i + 25]  # Process in chunks of 25
            client.batch_write_item(
                RequestItems={
                    table_name: batch
                }
            )

        print("Batch update completed.")

    except Exception as e:
        print(f"Error updating records: {e}")
