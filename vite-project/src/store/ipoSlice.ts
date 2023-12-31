// ipolistSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface IpoState {
    list: IPOList[];
    originalList: IPOList[]; // Store the original list
    selectedType: string; // New property for the selected type

}

export interface IPOList {
    id: number;
    name: string;
    type: string;
    lot_size: number;
    min_price: number;
    max_price: number;
    open: string;
    close: string;
    start_time: string;
    end_time: string;
    icon_url: string;
    allotment_link: string | null;
    market_link: string | null;
    subscription: string;
    about: string;
    address: string;
    registrar: string;
    premium: number;
    is_buyer: boolean;
    is_seller: boolean;
    allotment_date: string;
    listing_date: string;
    premium_percentage: number;
    current_status: string;
}

const initialState: IpoState = {
    list: [],
    originalList: [], // Initialize the original list

    selectedType: 'EQ', // Default selected type

    // other initial state properties
};

const ipolistSlice = createSlice({
    name: 'ipolist',
    initialState,
    reducers: {
        setlist: (state, action: PayloadAction<IPOList[]>) => {
            state.list = action.payload;
            state.originalList = action.payload; // Set the original list
        },
        filterByType: (state, action: PayloadAction<string>) => {
            const filterType = action.payload;
            state.selectedType = filterType;
            // You might want to reset the list to the original list and then filter
            state.list = state.originalList.filter(item => item.type === filterType);
        },
        searchByName: (state, action: PayloadAction<string>) => {
            // Convert the search term to lowercase for case-insensitive search
            const searchTerm = action.payload.toLowerCase();

            // Filter the list based on the name containing the search term
            state.list = state.list.filter(item => item.name.toLowerCase().includes(searchTerm));
        },
        setDefaultType: (state) => {
            state.selectedType = 'EQ'; // Set the default type
        },
    },
});

export const { setlist, filterByType, searchByName, setDefaultType } = ipolistSlice.actions;
export default ipolistSlice.reducer;
