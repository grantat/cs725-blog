import json
import csv


def yearAndAmounts():
    # country donor and amounts committed per year

    newjson = {}
    with open('../../data/v7/aid_data_full.csv') as f, \
            open('../../data/v7/country_year_amount.csv', 'w') as out:
        reader = csv.reader(f)
        writer = csv.writer(out)
        next(f, None)
        next(f, None)
        for row in reader:
            year = int(row[1])
            amount = float(row[4])
            donor_country = row[2]
            # 1991 to 2010 range
            newjson.setdefault(donor_country, {})
            newjson[donor_country].setdefault(year, 0.0)
            newjson[donor_country][year] += amount

        # add missing years to each country
        for year in range(1991, 2011):
            for key in newjson:
                newjson[key].setdefault(year, 0.0)

        print(json.dumps(newjson, indent=4, sort_keys=True))
        # donor -> state
        headers = list(range(1991, 2011))
        headers.insert(0, "donor")
        writer.writerow(headers)

        for donor, years in newjson.items():
            row = [donor]
            for year, amount in sorted(years.items()):
                # order
                row.append(amount)
            writer.writerow(row)


yearAndAmounts()
