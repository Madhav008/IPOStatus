import { Label } from "@radix-ui/react-label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export function AccountForm() {


    return (
        <div>
            <Label htmlFor="email">Email</Label>
            <Input type="email" id="email" placeholder="Email" />
            <Button type="submit">Update</Button>
        </div>
    )
}