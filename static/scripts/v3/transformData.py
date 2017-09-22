import json
import csv


def yearAndAmounts():
    outjson = []
    newjson = {}
    with open('../../data/v3/aid_data_full.csv') as f, \
            open('../../data/v3/year_amount.json', 'w') as out:
        reader = csv.reader(f)
        next(f, None)
        next(f, None)
        for row in reader:
            year = int(row[1])
            amount = float(row[4])
            if year in newjson:
                newjson[year] += amount
            else:
                newjson[year] = 0.0
                newjson[year] += amount

        for i in newjson:
            temp = {}
            temp["year"] = i
            temp["amount"] = newjson[i]
            outjson.append(temp)
        json.dump(outjson, out, sort_keys=True, indent=4)


def recipientAndAmount():
        outjson = []
        newjson = {}
        with open('../../data/v3/aid_data_full.csv') as f, \
                open('../../data/v3/recip_amount.json', 'w') as out:
            reader = csv.reader(f)
            next(f, None)
            next(f, None)
            for row in reader:
                recip = row[3].strip()
                amount = float(row[4])
                if recip in newjson:
                    newjson[recip] += amount
                else:
                    newjson[recip] = 0.0
                    newjson[recip] += amount

            for i in newjson:
                temp = {}
                temp["recip"] = i
                temp["amount"] = newjson[i]
                outjson.append(temp)
            json.dump(outjson, out, sort_keys=True, indent=4)


yearAndAmounts()
recipientAndAmount()
