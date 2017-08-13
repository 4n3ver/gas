import csv
import re
from collections import defaultdict
from operator import itemgetter
from datetime import datetime

TotalGroup = 0


EQ_CAR = 0
EQ_NR = 1
TRANS_WB_SN = 2
PRIOR_TRANS_WB_SN = 4
NEXT_TRANS_WB_SN = 5
MKTG_CD = 6
POOL_NR = 7
LE_IND = 8
SYSTM_PRVT_FORGN = 9
NS_MOVE_DISTANCE_MILES = 10
ONLN_MINS = 12
TRIP_START_TS = 26


def GetDataFromCSV():

	result = defaultdict(list)  # each entry of the dict is, by default, an empty list
	#Read csv per row
	with open('test.csv', 'rb') as csvfile:
	    csvreader = csv.reader(csvfile, delimiter=',', quotechar='"')
	    for row in csvreader:

	        #Result: ID_CAR
	        ID_CAR = str(row[EQ_CAR]).rstrip() + str(row[EQ_NR]).rstrip()
	 		
	        #Convert string to date data type
	        try:
	        	row[TRIP_START_TS] = datetime.strptime(row[TRIP_START_TS], '%m/%d/%Y %H:%M')
	        except ValueError:
	        	pass
	        			
			#Cast the '?' to something
			if (row[SYSTM_PRVT_FORGN] == '?'):
				row[SYSTM_PRVT_FORGN] = ''

			if (row[POOL_NR] == '?'):
				row[POOL_NR] = ''
	        
	        if (row[MKTG_CD] == '?'):
				row[MKTG_CD] = ''

	        if (row[NS_MOVE_DISTANCE_MILES] == '?'):
				row[NS_MOVE_DISTANCE_MILES] = 0
					
	        #Store the result
	        result[ID_CAR].append(row[2:])

	#Remove the header
	result.pop('EQ_INITEQ_NR', None)
	TotalGroup = len(result)
	print 'Finish Reading'
	return result

def main(result):


	with open('testing.csv', 'wb') as csvwrite:
		writer = csv.writer(csvwrite)
		#Read Through per group
		for key_result in result.keys():
			process = defaultdict(list)
			CycleCount = 0

			CarId = result[key_result]
			#PreviousState = result[key_result][index-1]

			#Length of the column
			CarIdCount = len(CarId)

			#Sort according to the date
			result[key_result].sort(key=itemgetter(TRIP_START_TS-2))

			#Process the data

			#Take all if it is only one row
			if( (CarIdCount == 1) and (CarId[0][LE_IND-2] == 'E') ):
				#Store the process
				process[0].append(result[key_result][0])

				#Write the result by groupid
				WriteToCsv(key_result, process, writer)
				#Remove the entry after write
				result.pop(key_result)	


			if(CarIdCount > 1):

				for index in range(0, CarIdCount):
					
					if ( (index == 0) and (CarId[index][LE_IND-2] == 'E') ):
		
						process[CycleCount].append(result[key_result][index])

					if (index > 0):
						#Check Waybill Sequence
						if ( (CarId[index-1][TRANS_WB_SN-2] == CarId[index][PRIOR_TRANS_WB_SN-2]) and (CarId[index][TRANS_WB_SN-2] == CarId[index-1][NEXT_TRANS_WB_SN-2]) ):

							# if the current indicator is 'L' and the previous indicator ia 'E'
							if (CarId[index][LE_IND-2] == 'E'):
								if (CarId[index-1][LE_IND-2] == 'L'):
									# make a new group
									CycleCount += 1
								process[CycleCount].append(result[key_result][index])
							else:
								if ( not((CarId[index-1][LE_IND-2] == 'L') and (len(process[CycleCount]) == 0)) ):
									process[CycleCount].append(result[key_result][index])

						else:

							# if current indicator is 'E', create a new group, ignore otherwise
							if ( CarId[index][LE_IND-2] == 'E' ):
								CycleCount = CycleCount + 1
								process[CycleCount].append(result[key_result][index])
							else:
							 	CycleCount += 1
				
				#Delete empty last entry
				if ( len(process[CycleCount]) == 0 ):
					process.pop(CycleCount, None)

				#Write the result by groupid
				WriteToCsv(key_result, process, writer)

				#Remove the entry after write
				result.pop(key_result)		

def WriteToCsv(key_result, process, writer):
	
	for key_process in process.keys():

		Entry = []


		EmptyWaybill = ''
		EmptyCount = 0
		EmptyMoveDistance = 0
		EmptyMarketingCode = []
		EmptySystemPrivateForeign = []
		EmptyPoolNumber = []

		LoadWaybill = ''
		LoadCount = 0
		LoadMoveDistance = 0
		LoadMarketingCode = []
		LoadSystemPrivateForeign = []
		LoadPoolNumber = []

		for index in range(0, len(process[key_process])):

			InsideProcess = process[key_process][index]

			if ( process[key_process][index][LE_IND-2] == 'E' ):
				#Emptywaybill
				EmptyWaybill += str(InsideProcess[TRANS_WB_SN-2]) + ' '
				#Emptycount
				EmptyCount += 1
				#EmptyMoveDistance
				EmptyMoveDistance += float(InsideProcess[NS_MOVE_DISTANCE_MILES-2])
				#EmptyMarketingCode
				EmptyMarketingCode.append(InsideProcess[MKTG_CD-2])
				#EmptySystemPrivateForeign
				EmptySystemPrivateForeign.append(InsideProcess[SYSTM_PRVT_FORGN-2])
				#EmptyPoolNumber
				EmptyPoolNumber.append(InsideProcess[POOL_NR-2])



			else:
				#Loadwaybill
				LoadWaybill += str(InsideProcess[TRANS_WB_SN-2]) + ' '
				#LoadCount
				LoadCount += 1
				#LoadMoveDistance
				LoadMoveDistance += float(InsideProcess[NS_MOVE_DISTANCE_MILES-2])
				#LoadMarketingCode
				LoadMarketingCode.append(InsideProcess[MKTG_CD-2])
				#LoadSystemPrivateForeign
				LoadSystemPrivateForeign.append(InsideProcess[SYSTM_PRVT_FORGN-2])
				#LoadPoolNumber
				LoadPoolNumber.append(InsideProcess[POOL_NR-2])


		Entry.append(key_result)
		Entry.append(re.match(r"([a-z]+)([0-9]+)", key_result, re.I).groups()[0])
		Entry.append(re.match(r"([a-z]+)([0-9]+)", key_result, re.I).groups()[1])

		Entry.append(EmptyWaybill.rstrip())
		Entry.append(EmptyCount)
		Entry.append(EmptyMoveDistance)
		Entry.append(GetUnique(EmptyMarketingCode))
		Entry.append(GetUnique(EmptySystemPrivateForeign))
		Entry.append(GetUnique(EmptyPoolNumber))

		Entry.append(LoadWaybill.rstrip())
		Entry.append(LoadCount)
		Entry.append(LoadMoveDistance)
		Entry.append(GetUnique(LoadMarketingCode))
		Entry.append(GetUnique(LoadSystemPrivateForeign))
		Entry.append(GetUnique(LoadPoolNumber))

		# with open('result.csv', 'ab') as csvwrite:
		#writer = csv.writer(csvwrite)
		writer.writerow(Entry)


def GetUnique(val):
	tmp = ''
	for unique in set(val):
		tmp = unique + ' '
	return tmp.rstrip()

def printProcess(process):

	for key_process in process.keys():
		print 'Group ' + str(key_process)

		for index in range(0, len(process[key_process])):

			print 'Waybill ' + str(process[key_process][index][0]) + ' indicator ' + str(process[key_process][index][6])

main(GetDataFromCSV())
