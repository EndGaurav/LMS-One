import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import React, { useState } from 'react'


const categories = [
  { id: "nextjs", label: "Next JS" },
  { id: "data science", label: "Data Science" },
  { id: "frontend development", label: "Frontend Development" },
  { id: "fullstack development", label: "Fullstack Development" },
  { id: "mern stack development", label: "MERN Stack Development" },
  { id: "backend development", label: "Backend Development" },
  { id: "javascript", label: "Javascript" },
  { id: "python", label: "Python" },
  { id: "docker", label: "Docker" },
  { id: "mongodb", label: "MongoDB" },
  { id: "html", label: "HTML" },
  { id: "yoga", label: "YOGA" },
  { id: "leadership", label: "Leadership" },
  { id: "marketing", label: "Marketing" },
  { id: "nosql", label: "NoSQL" },
  { id: "sql", label: "SQL" }
];

const Filter = ({ filterHandler }) => {

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortByPrice, setSortByPrice] = useState("");


  const categoryChangeHandler = (categoryId) => {

    setSelectedCategories((prevCategory) => {
      const newCategory = prevCategory.includes(categoryId) ? prevCategory.filter((id) => id !== categoryId) : [...prevCategory, categoryId];

      filterHandler(newCategory, sortByPrice);

      return newCategory;
    });
  }

  const selectByPriceHandler = (selectedValue) => {
    setSortByPrice(selectedValue);
    filterHandler(selectedCategories, selectedValue);
  }
  return (
    <div className='w-full md:w-[20%]'>
      <div className='flex items-center justify-between'>
        <h1 className='font-semibold text-lg md:text-xl '>Filter Options</h1>
        <Select onValueChange={selectByPriceHandler}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Sort by price</SelectLabel>
              <SelectItem value="low">Low to High</SelectItem>
              <SelectItem value="high">High to Low</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <Separator className="my-4" />
      <div>
        <h1 className="font-semibold mb-2">CATEGORY</h1>
        {
          categories.map((category) => (
            <div key={category.id} className='flex items-center space-x-2 my-2'>
              <Checkbox
                id={category.id}
                onCheckedChange={() => categoryChangeHandler(category.id)}
              />
              <Label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor={category.id}
              >{category.label}</Label>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default Filter