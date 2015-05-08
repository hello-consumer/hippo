str = File.open('./distance_map.txt').read.split("\n")
ing_list = str.shift.split("&&&&").inspect
tmp = []
str.each do |s|
	tmp.push s.split(" ").inspect
end
matrix = tmp.join(",").inspect

puts ing_list.inspect
puts matrix.inspect