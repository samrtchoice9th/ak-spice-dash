
import React from 'react';

interface DropdownItemsListProps {
  filteredItems: string[];
  selectedIndex: number;
  onItemSelect: (item: string) => void;
}

export const DropdownItemsList: React.FC<DropdownItemsListProps> = ({
  filteredItems,
  selectedIndex,
  onItemSelect
}) => {
  if (filteredItems.length === 0) {
    return (
      <div className="px-3 py-2 text-gray-500">No items found</div>
    );
  }

  return (
    <>
      {filteredItems.map((item, index) => (
        <div
          key={index}
          className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${
            selectedIndex === index ? 'bg-blue-100' : ''
          }`}
          onClick={() => onItemSelect(item)}
        >
          {item}
        </div>
      ))}
    </>
  );
};
