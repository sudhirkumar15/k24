<?php 
echo "string";
declare(strict_types = 1);

function test (float $x, float $y) : float {
//function arraysSum(array ...$arrays): array {}
  $x = 1;
  return $x // so here you can make your code strict type or not ur wish
  // if u r returning other then fload then it will show fatal error.
}
___________________________________________
Spaceship Operator :: 
$compare = 2 <=> 1
2 < 1? return -1
2 = 1? return 0
2 > 1? return 1
___________________________________________
Null Coalesce Operator ::
$name = $firstName ??  "Guest"; // this will return $firstName or Guest depending on $firstName is null or not.
new function random_int(1,20);
___________________________________________
sprede operatore : 
function sumOfInts(int ...$ints)
// function sumOfInts(...$ints)
{
    return array_sum($ints);
}

var_dump(sumOfInts(2, 3, 4));
___________________________________________
Constant arrays using define() 
define('ANIMALS', [
    'dog',
    'cat',
    'bird'
]);

echo ANIMALS[1]; // outputs "cat"
___________________________________________
php 7 also support anonymous class :: 
cd /var/www/zipp/ttoday/PDFNET && ./PDFtoXOD /var/www/9784860343101.pdf /var/www/9784860343101.xod -f xod


?>
