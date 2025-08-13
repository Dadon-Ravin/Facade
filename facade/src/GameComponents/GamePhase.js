import Hand from './Hand';
import Card from './Card';
import { useState } from 'react';
import { ref, update, set } from 'firebase/database';
import { db } from '../firebase';

function GamePhase({ }) {


    return (
        <div>
            <p>Game Phase!</p>
        </div>
    )
};

export default GamePhase;